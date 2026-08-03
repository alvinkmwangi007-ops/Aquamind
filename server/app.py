import os
from dotenv import load_dotenv
from flask import Flask
from flask_migrate import Migrate
from server.extensions import db, ma, cors, jwt
from server.controllers.user_controller import user_bp
from server.controllers.log_controller import log_bp
from server.controllers.goal_controller import goal_bp
from server.controllers.reminder_controller import reminder_bp
from server.controllers.activity_controller import activity_bp
from server.controllers.course_controller import course_bp


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


def create_app():
    app = Flask(__name__)
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", "sqlite:///server.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "super-secret-change-me"),
        JWT_ACCESS_TOKEN_EXPIRES=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600)),
    )

    db.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    jwt.init_app(app)
    Migrate(app, db)

    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(log_bp, url_prefix="/api/logs")
    app.register_blueprint(goal_bp, url_prefix="/api/goals")
    app.register_blueprint(reminder_bp, url_prefix="/api/reminders")
    app.register_blueprint(activity_bp, url_prefix="/api/activities")
    app.register_blueprint(course_bp, url_prefix="/api/courses")

    @app.route("/")
    def index():
        return {"message": "AquaMind server running"}

    return app


app = create_app()
