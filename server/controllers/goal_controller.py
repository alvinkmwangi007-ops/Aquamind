from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.extensions import db
from server.models.goal import Goal
from server.schemas.goal_schema import GoalSchema

goal_bp = Blueprint("goal_bp", __name__)
goal_schema = GoalSchema()
goals_schema = GoalSchema(many=True)


@goal_bp.route("/", methods=["GET"])
@jwt_required()
def get_goals():
    identity = get_jwt_identity()
    user_id = int(identity)
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    query = Goal.query.filter_by(user_id=user_id).order_by(Goal.set_at.desc())
    results = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "data": goals_schema.dump(results.items),
        "total": results.total,
        "page": results.page,
        "per_page": results.per_page,
        "total_pages": results.pages,
    })


@goal_bp.route("/", methods=["POST"])
@jwt_required()
def create_goal():
    data = request.get_json()
    identity = get_jwt_identity()
    goal = Goal(user_id=identity["id"], daily_target_ml=data["daily_target_ml"])
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal_schema.dump(goal)), 201


@goal_bp.route("/stats", methods=["GET"])
@jwt_required()
def goal_stats():
    identity = get_jwt_identity()
    total_goals = Goal.query.filter_by(user_id=identity["id"]).count()
    return jsonify({"total_goals": total_goals})
