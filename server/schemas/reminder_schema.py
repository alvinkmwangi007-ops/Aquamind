from server.extensions import ma
from server.models.reminder import Reminder


class ReminderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Reminder
        load_instance = True
        include_fk = True

    user = ma.Nested("UserSchema", exclude=("logs", "goals", "reminders", "activities", "enrollments"), many=False)
