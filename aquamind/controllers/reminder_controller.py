from flask import Blueprint, request, jsonify
from extensions import db
from models.reminder import Reminder
from schemas.reminder_schema import ReminderSchema

reminder_bp = Blueprint("reminder_bp", __name__)
reminder_schema = ReminderSchema()
reminders_schema = ReminderSchema(many=True)

@reminder_bp.route("/reminders", methods=["GET"])
def get_reminders():
    reminders = Reminder.query.all()
    return jsonify(reminders_schema.dump(reminders))

@reminder_bp.route("/reminders", methods=["POST"])
def create_reminder():
    data = request.get_json()
    new_reminder = reminder_schema.load(data, session=db.session)
    db.session.add(new_reminder)
    db.session.commit()
    return reminder_schema.jsonify(new_reminder), 201
