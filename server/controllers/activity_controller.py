from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.extensions import db
from server.models.activity import Activity
from server.schemas.activity_schema import ActivitySchema

activity_bp = Blueprint("activity_bp", __name__)
activity_schema = ActivitySchema()
activities_schema = ActivitySchema(many=True)


@activity_bp.route("/", methods=["GET"])
@jwt_required()
def get_activities():
    identity = get_jwt_identity()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    user_id = int(identity)
    query = Activity.query.filter_by(user_id=user_id).order_by(Activity.logged_at.desc())
    results = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "data": activities_schema.dump(results.items),
        "total": results.total,
        "page": results.page,
        "per_page": results.per_page,
        "total_pages": results.pages,
    })


@activity_bp.route("/", methods=["POST"])
@jwt_required()
def create_activity():
    data = request.get_json()
    identity = get_jwt_identity()
    activity = Activity(
        user_id=identity["id"],
        activity_type=data["activity_type"],
        duration_minutes=data["duration_minutes"],
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify(activity_schema.dump(activity)), 201
