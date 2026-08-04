from flask import Flask
from extensions import db, ma, cors

# Import controllers (blueprints)
from controllers.user_controller import user_bp
from controllers.water_log_controller import water_log_bp
from controllers.goal_controller import goal_bp
from controllers.reminder_controller import reminder_bp
from controllers.activity_controller import activity_bp


def create_app():
    app = Flask(__name__)

    # Database config
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///aquamind.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints under the shared API prefix
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(water_log_bp, url_prefix="/api")
    app.register_blueprint(goal_bp, url_prefix="/api")
    app.register_blueprint(reminder_bp, url_prefix="/api")
    app.register_blueprint(activity_bp, url_prefix="/api")

    # Health check route
    @app.route("/")
    def index():
        return {"message": "✅ Aquamind backend running successfully!"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
