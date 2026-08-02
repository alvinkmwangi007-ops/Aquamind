from extensions import ma
from models.profile import Profile


class ProfileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Profile
        load_instance = True
        include_fk = True
        exclude = ("user",)
