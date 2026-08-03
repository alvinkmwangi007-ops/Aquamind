from server.extensions import db


class WaterLog(db.Model):
    __tablename__ = "water_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount_ml = db.Column(db.Integer, nullable=False)
    logged_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship("User", back_populates="logs")
