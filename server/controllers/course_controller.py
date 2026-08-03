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
    # Return courses with enrollment counts (aggregation)
    results = (
        db.session.query(Course, func.count(Enrollment.id).label("enrolled_count"))
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id)
        .order_by(Course.created_at.desc())
        .all()
    )

    payload = []
    for course, count in results:
        c = course_schema.dump(course)
        c["enrolled_count"] = count
        payload.append(c)
    return jsonify(payload)


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
    identity = get_jwt_identity()
    data = request.get_json()
    if not data.get("course_id"):
        return jsonify({"message": "course_id required"}), 400

    enrollment = Enrollment(user_id=identity["id"], course_id=data["course_id"], grade=data.get("grade"))
    db.session.add(enrollment)
    db.session.commit()
    return jsonify(enrollment_schema.dump(enrollment)), 201


@course_bp.route("/enrollments", methods=["GET"])
@jwt_required()
def get_enrollments():
    identity = get_jwt_identity()
    enrollments = Enrollment.query.filter_by(user_id=identity["id"]).all()
    return jsonify(enrollments_schema.dump(enrollments))
