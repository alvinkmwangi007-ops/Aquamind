from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from schemas.user_schema import UserSchema

user_bp = Blueprint("user_bp", __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)

@user_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users))

@user_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    new_user = user_schema.load(data, session=db.session)
    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user), 201
