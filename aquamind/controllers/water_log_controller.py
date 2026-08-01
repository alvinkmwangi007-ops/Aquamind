from flask import Blueprint, request, jsonify
from extensions import db
from models.water_log import WaterLog
from schemas.water_log_schema import WaterLogSchema

water_log_bp = Blueprint("water_log_bp", __name__)
water_log_schema = WaterLogSchema()
water_logs_schema = WaterLogSchema(many=True)

@water_log_bp.route("/logs", methods=["GET"])
def get_logs():
    logs = WaterLog.query.all()
    return jsonify(water_logs_schema.dump(logs))

@water_log_bp.route("/logs", methods=["POST"])
def create_log():
    data = request.get_json()
    new_log = water_log_schema.load(data, session=db.session)
    db.session.add(new_log)
    db.session.commit()
    return water_log_schema.jsonify(new_log), 201
