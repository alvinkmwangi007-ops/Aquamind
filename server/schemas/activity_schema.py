from extensions import ma
from models.activity import Activity


class ActivitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Activity
        load_instance = True
        include_fk = True

    user = ma.Nested("UserSchema", exclude=("logs", "goals", "reminders", "activities", "enrollments"), many=False)
