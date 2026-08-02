from server.extensions import ma
from server.models.activity import Activity
from server.schemas.user_schema import UserPublicSchema


class ActivitySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Activity
        load_instance = True
        include_fk = True

    user = ma.Nested(UserPublicSchema, many=False)
