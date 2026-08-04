from flask import Blueprint, request, jsonify
from extensions import db
from models.activity import Activity
from schemas.activity_schema import ActivitySchema

activity_bp = Blueprint("activity_bp", __name__)
activity_schema = ActivitySchema()
activities_schema = ActivitySchema(many=True)

@activity_bp.route("/activities", methods=["GET"])
def get_activities():
    activities = Activity.query.all()
    return jsonify(activities_schema.dump(activities)), 200

@activity_bp.route("/activities", methods=["POST"])
def create_activity():
    data = request.get_json()
    new_activity = activity_schema.load(data, session=db.session)
    db.session.add(new_activity)
    db.session.commit()

    return jsonify(activity_schema.dump(new_activity)), 201


