from extensions import ma
from models.goal import Goal

class GoalSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Goal
        load_instance = True
        include_fk = True
