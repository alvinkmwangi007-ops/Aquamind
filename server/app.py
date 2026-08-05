import os

from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_jwt_extended.exceptions import JWTExtendedException
from server.controllers.activity_controller import activity_bp
from server.controllers.course_controller import course_bp
from server.controllers.goal_controller import goal_bp
from server.controllers.log_controller import log_bp
from server.controllers.reminder_controller import reminder_bp
from server.controllers.user_controller import user_bp
from server.extensions import cors, db, jwt, ma
from server.models.user import User

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False

    database_url = os.getenv("DATABASE_URL", "sqlite:///aquamind.db")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-only-change-me-to-a-32-char-secret")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Safety net for environments where migrations were not run yet.
    with app.app_context():
        db.create_all()

        # Demo accounts for presentation logins.
        demo_accounts = [
            {"username": "admin", "email": "admin@test.com", "password": "admin123", "role": "admin"},
            {"username": "presenter", "email": "presenter@test.com", "password": "pass1234", "role": "user"},
            {"username": "userone", "email": "user1@test.com", "password": "user123", "role": "user"},
            {"username": "usertwo", "email": "user2@test.com", "password": "user123", "role": "user"},
            {"username": "user", "email": "user@test.com", "password": "user123", "role": "user"},
        ]

        for account in demo_accounts:
            existing = User.query.filter(
                (User.username == account["username"]) | (User.email == account["email"])
            ).first()

            if not existing:
                existing = User(username=account["username"], email=account["email"], role=account["role"])
                db.session.add(existing)

            existing.username = account["username"]
            existing.email = account["email"]
            existing.role = account["role"]
            existing.set_password(account["password"])

        db.session.commit()

    allowed_origins = [
        "https://aquamind-eight.vercel.app",
        "https://aquamind-3.vercel.app",
        "https://aquamind-2-client.vercel.app",
        "https://aquamind-client-y6re.vercel.app",
        "https://aquamind-3.onrender.com",
        r"https://.*\.vercel\.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if extra_origins:
        allowed_origins.extend(origin.strip() for origin in extra_origins.split(",") if origin.strip())

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"],
    )

    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(log_bp, url_prefix="/api/logs")
    app.register_blueprint(goal_bp, url_prefix="/api/goals")
    app.register_blueprint(reminder_bp, url_prefix="/api/reminders")
    app.register_blueprint(activity_bp, url_prefix="/api/activities")
    app.register_blueprint(course_bp, url_prefix="/api/courses")

    @jwt.unauthorized_loader
    def unauthorized_callback(_reason):
        return jsonify({"message": "Authentication required"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(_reason):
        return jsonify({"message": "Invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"message": "Token has expired"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"message": "Token has been revoked"}), 401

    @app.errorhandler(404)
    def handle_not_found(_error):
        if request.path.startswith("/api/"):
            return jsonify({"message": "Resource not found"}), 404
        return jsonify({"message": "Not found"}), 404

    @app.errorhandler(JWTExtendedException)
    def handle_jwt_errors(_error):
        return jsonify({"message": "Authentication error"}), 401

    @app.route("/")
    def healthcheck():
        return jsonify({"status": "ok", "service": "aquamind-backend"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)