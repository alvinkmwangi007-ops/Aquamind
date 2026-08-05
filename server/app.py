import os

from flask import Flask, jsonify
from flask_migrate import Migrate
from server.controllers.activity_controller import activity_bp
from server.controllers.course_controller import course_bp
from server.controllers.goal_controller import goal_bp
from server.controllers.log_controller import log_bp
from server.controllers.reminder_controller import reminder_bp
from server.controllers.user_controller import user_bp
from server.extensions import cors, db, jwt, ma

migrate = Migrate()

def create_app():
    app = Flask(__name__)

    database_url = os.getenv("DATABASE_URL", "sqlite:///aquamind.db")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    allowed_origins = [
        "https://aquamind-3.vercel.app",
        "https://aquamind-2-client.vercel.app",
        "https://aquamind-client-y6re.vercel.app",
        "https://aquamind-3.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if extra_origins:
        allowed_origins.extend(origin.strip() for origin in extra_origins.split(",") if origin.strip())

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        allow_origin_regex=r"https://.*\.vercel\.app",
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

    @app.route("/")
    def healthcheck():
        return jsonify({"status": "ok", "service": "aquamind-backend"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)