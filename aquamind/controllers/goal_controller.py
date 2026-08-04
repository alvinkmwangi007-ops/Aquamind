from flask import Blueprint, request, jsonify
from extensions import db
from models.goal import Goal
from schemas.goal_schema import GoalSchema

goal_bp = Blueprint("goal_bp", __name__)
goal_schema = GoalSchema()
goals_schema = GoalSchema(many=True)

@goal_bp.route("/goals", methods=["GET"])
def get_goals():
    goals = Goal.query.all()
    return jsonify(goals_schema.dump(goals)), 200

@goal_bp.route("/goals", methods=["POST"])
def create_goal():
    data = request.get_json()
    new_goal = goal_schema.load(data, session=db.session)
    db.session.add(new_goal)
    db.session.commit()
    return jsonify(goal_schema.dump(new_goal)), 201
