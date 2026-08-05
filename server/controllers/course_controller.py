from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func
from server.extensions import db
from server.models.course import Course
from server.models.enrollment import Enrollment
from server.schemas.course_schema import CourseSchema
from server.schemas.enrollment_schema import EnrollmentSchema

course_bp = Blueprint("course_bp", __name__)
course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)
enrollment_schema = EnrollmentSchema()
enrollments_schema = EnrollmentSchema(many=True)


@course_bp.route("/", methods=["GET"])
@jwt_required()
def get_courses():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    # Return courses with enrollment counts (join + aggregation)
    query = (
        db.session.query(Course, func.count(Enrollment.id).label("enrolled_count"))
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id)
        .order_by(Course.created_at.desc())
    )
    results = query.paginate(page=page, per_page=per_page, error_out=False)

    payload = []
    for course, count in results.items:
        c = course_schema.dump(course)
        c["enrolled_count"] = count
        payload.append(c)
    return jsonify({
        "data": payload,
        "total": results.total,
        "page": results.page,
        "per_page": results.per_page,
        "total_pages": results.pages,
    })


@course_bp.route("/", methods=["POST"])
@jwt_required()
def create_course():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Admin access required"}), 403

    data = request.get_json()
    course = Course(name=data["name"], description=data.get("description"))
    db.session.add(course)
    db.session.commit()
    return jsonify(course_schema.dump(course)), 201


@course_bp.route("/enroll", methods=["POST"])
@jwt_required()
def enroll_course():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data.get("course_id"):
        return jsonify({"message": "course_id required"}), 400

    enrollment = Enrollment(user_id=user_id, course_id=data["course_id"], grade=data.get("grade"))
    db.session.add(enrollment)
    db.session.commit()
    return jsonify(enrollment_schema.dump(enrollment)), 201


@course_bp.route("/enrollments", methods=["GET"])
@jwt_required()
def get_enrollments():
    user_id = int(get_jwt_identity())
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    enrollments = Enrollment.query.filter_by(user_id=user_id).order_by(Enrollment.enrolled_at.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False,
    )
    return jsonify({
        "data": enrollments_schema.dump(enrollments.items),
        "total": enrollments.total,
        "page": enrollments.page,
        "per_page": enrollments.per_page,
        "total_pages": enrollments.pages,
    })


@course_bp.route("/enrollment-stats", methods=["GET"])
@jwt_required()
def enrollment_stats():
    user_id = int(get_jwt_identity())
    stats = (
        db.session.query(Enrollment.grade, func.count(Enrollment.id).label("count"))
        .join(Course, Course.id == Enrollment.course_id)
        .filter(Enrollment.user_id == user_id)
        .group_by(Enrollment.grade)
        .order_by(func.count(Enrollment.id).desc())
        .all()
    )
    return jsonify([
        {"grade": grade if grade else "ungraded", "count": count}
        for grade, count in stats
    ])
