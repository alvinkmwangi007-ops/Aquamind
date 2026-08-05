from server.extensions import db
import bcrypt
from werkzeug.security import check_password_hash


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    profile = db.relationship("Profile", uselist=False, back_populates="user")
    logs = db.relationship("WaterLog", back_populates="user", cascade="all, delete-orphan")
    goals = db.relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    reminders = db.relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    activities = db.relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def check_password(self, password):
        if self.password_hash.startswith("$2a$") or self.password_hash.startswith("$2b$") or self.password_hash.startswith("$2y$"):
            return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))
        return check_password_hash(self.password_hash, password)
