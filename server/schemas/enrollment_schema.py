from server.extensions import ma
from server.models.enrollment import Enrollment
from server.schemas.user_schema import UserPublicSchema


class EnrollmentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Enrollment
        load_instance = True
        include_fk = True

    user = ma.Nested(UserPublicSchema, many=False)
    course = ma.Nested("CourseSchema", exclude=("enrollments",), many=False)
