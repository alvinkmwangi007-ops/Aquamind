from extensions import ma
from models.water_log import WaterLog

class WaterLogSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = WaterLog
        load_instance = True
        include_fk = True
