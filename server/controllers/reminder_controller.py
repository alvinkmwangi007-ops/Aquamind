from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.reminder import Reminder
from schemas.reminder_schema import ReminderSchema

reminder_bp = Blueprint("reminder_bp", __name__)
reminder_schema = ReminderSchema()
reminders_schema = ReminderSchema(many=True)


@reminder_bp.route("/", methods=["GET"])
@jwt_required()
def get_reminders():
    identity = get_jwt_identity()
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    query = Reminder.query.filter_by(user_id=identity["id"]).order_by(Reminder.remind_at.asc())
    results = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "data": reminders_schema.dump(results.items),
        "total": results.total,
        "page": results.page,
        "per_page": results.per_page,
        "total_pages": results.pages,
    })


@reminder_bp.route("/", methods=["POST"])
@jwt_required()
def create_reminder():
    data = request.get_json()
    identity = get_jwt_identity()
    reminder = Reminder(user_id=identity["id"], message=data["message"], remind_at=data["remind_at"])
    db.session.add(reminder)
    db.session.commit()
    return jsonify(reminder_schema.dump(reminder)), 201
