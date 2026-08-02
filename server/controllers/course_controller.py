from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.course import Course
from models.enrollment import Enrollment
from schemas.course_schema import CourseSchema
from schemas.enrollment_schema import EnrollmentSchema

course_bp = Blueprint("course_bp", __name__)
course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)
enrollment_schema = EnrollmentSchema()
enrollments_schema = EnrollmentSchema(many=True)


@course_bp.route("/", methods=["GET"])
@jwt_required()
def get_courses():
    courses = Course.query.order_by(Course.created_at.desc()).all()
    return jsonify(courses_schema.dump(courses))


@course_bp.route("/", methods=["POST"])
@jwt_required()
def create_course():
    identity = get_jwt_identity()
    if identity["role"] != "admin":
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
