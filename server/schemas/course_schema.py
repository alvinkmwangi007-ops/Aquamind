from server.extensions import ma
from server.models.course import Course


class CourseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Course
        load_instance = True
        include_fk = True

    enrollments = ma.Nested("EnrollmentSchema", exclude=("course",), many=True)
