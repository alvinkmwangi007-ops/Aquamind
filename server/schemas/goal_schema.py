from server.extensions import ma
from server.models.goal import Goal


class GoalSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Goal
        load_instance = True
        include_fk = True

    user = ma.Nested("UserSchema", exclude=("logs", "goals", "reminders", "activities", "enrollments"), many=False)
