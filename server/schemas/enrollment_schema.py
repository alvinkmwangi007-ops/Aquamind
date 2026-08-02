from extensions import ma
from models.enrollment import Enrollment


class EnrollmentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Enrollment
        load_instance = True
        include_fk = True

    user = ma.Nested("UserSchema", exclude=("logs", "goals", "reminders", "activities", "enrollments"), many=False)
    course = ma.Nested("CourseSchema", exclude=("enrollments",), many=False)
