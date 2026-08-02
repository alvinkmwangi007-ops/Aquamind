from extensions import ma
from models.user import User


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        exclude = ("password_hash",)

    profile = ma.Nested("ProfileSchema", exclude=("user",), many=False)
    enrollments = ma.Nested("EnrollmentSchema", exclude=("user",), many=True)
