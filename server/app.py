import os

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS

# 1. Initialize extensions globally
db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()

def create_app():
    app = Flask(__name__)

    # 2. Add your application configuration here
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///aquamind.db")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # 3. Bind extensions to the app instance
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app)  # Binds migration engine to app and db

    # 4. Initialize CORS with explicit origins for the frontend and local dev
    allowed_origins = [
        "https://aquamind-3.vercel.app",
        "https://aquamind-2-client.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    extra_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if extra_origins:
        allowed_origins.extend(origin.strip() for origin in extra_origins.split(",") if origin.strip())

    cors.init_app(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        allow_origin_regex=r"https://.*\.vercel\.app",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"],
    )

    # Example test route inside the /api/ ecosystem
    @app.route('/api/logs', methods=['GET'])
    def get_logs():
        return jsonify({"status": "success", "message": "CORS preflight passed!"})

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)