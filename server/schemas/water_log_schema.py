from server.extensions import ma
from server.models.water_log import WaterLog
from server.schemas.user_schema import UserPublicSchema


class WaterLogSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WaterLog
        load_instance = True
        include_fk = True

    user = ma.Nested(UserPublicSchema, many=False)
