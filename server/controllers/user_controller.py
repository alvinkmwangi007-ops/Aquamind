from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from schemas.user_schema import UserSchema

user_bp = Blueprint("user_bp", __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)


@user_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json() or {}
    if not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "username, email, and password required"}), 400

    if User.query.filter((User.username == data["username"]) | (User.email == data["email"]) ).first():
        return jsonify({"message": "User with that username or email already exists"}), 409

    user = User(username=data["username"], email=data["email"], role=data.get("role", "user"))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    return jsonify(user_schema.dump(user)), 201


@user_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json() or {}
    user = User.query.filter_by(username=data.get("username")).first()
    if not user or not user.check_password(data.get("password")):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity={"id": user.id, "role": user.role})
    return jsonify({"access_token": token, "user": user_schema.dump(user)})


@user_bp.route("/me", methods=["GET"])
@jwt_required()
def current_user():
    identity = get_jwt_identity()
    user = User.query.get(identity["id"])
    return jsonify(user_schema.dump(user))


@user_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    users = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "data": users.items,
        "total": users.total,
        "page": users.page,
        "per_page": users.per_page,
        "total_pages": users.pages,
    })


@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    identity = get_jwt_identity()
    if identity["role"] != "admin":
        return jsonify({"message": "Admin access required"}), 403

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})
