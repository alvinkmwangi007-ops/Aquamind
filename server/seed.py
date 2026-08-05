from datetime import datetime, timedelta

from server.app import create_app
from server.extensions import db
from server.models.user import User

DEMO_ACCOUNTS = [
    {
        "username": "admin",
        "email": "admin@test.com",
        "password": "admin123",
        "role": "admin",
        "created_at": datetime.utcnow() - timedelta(days=45),
    },
    {
        "username": "presenter",
        "email": "presenter@test.com",
        "password": "pass1234",
        "role": "user",
        "created_at": datetime.utcnow() - timedelta(days=21),
    },
    {
        "username": "userone",
        "email": "user1@test.com",
        "password": "user123",
        "role": "user",
        "created_at": datetime.utcnow() - timedelta(days=14),
    },
    {
        "username": "usertwo",
        "email": "user2@test.com",
        "password": "user123",
        "role": "user",
        "created_at": datetime.utcnow() - timedelta(days=7),
    },
]


def upsert_demo_user(account):
    user = User.query.filter((User.username == account["username"]) | (User.email == account["email"])).first()
    if not user:
        user = User(username=account["username"], email=account["email"])
        db.session.add(user)

    user.username = account["username"]
    user.email = account["email"]
    user.role = account["role"]
    user.created_at = account["created_at"]
    user.set_password(account["password"])
    return user


def seed_data():
    app = create_app()
    with app.app_context():
        # Safe after flask db upgrade; this is a no-op when tables already exist.
        db.create_all()

        users = [upsert_demo_user(account) for account in DEMO_ACCOUNTS]
        db.session.commit()

        print("Seeded demo accounts:")
        for user in users:
            print({"username": user.username, "email": user.email, "role": user.role, "created_at": user.created_at.isoformat()})


if __name__ == "__main__":
    seed_data()
