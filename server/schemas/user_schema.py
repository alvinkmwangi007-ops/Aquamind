from server.extensions import ma
from server.models.user import User
from marshmallow import fields


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_fk = True
        exclude = ("password_hash",)

    profile = ma.Nested("ProfileSchema", exclude=("user",), many=False)
    enrollments = ma.Nested("EnrollmentSchema", exclude=("user",), many=True)


class UserPublicSchema(ma.Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()
    role = fields.Str()
    created_at = fields.DateTime()
