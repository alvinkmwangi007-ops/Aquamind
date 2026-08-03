import os
from faker import Faker
from server.app import create_app
from server.extensions import db
from server.models.user import User
from server.models.profile import Profile
from server.models.water_log import WaterLog
from server.models.goal import Goal
from server.models.reminder import Reminder
from server.models.activity import Activity
from server.models.course import Course
from server.models.enrollment import Enrollment


def seed_data():
    fake = Faker()
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        admin = User(username="admin", email="admin@example.com", role="admin")
        admin.set_password("adminpass")
        user = User(username="user", email="user@example.com", role="user")
        user.set_password("userpass")

        db.session.add_all([admin, user])
        db.session.commit()

        db.session.add(Profile(user_id=admin.id, birthday=fake.date_of_birth(), height_cm=180, weight_kg=75, bio="Admin user."))
        db.session.add(Profile(user_id=user.id, birthday=fake.date_of_birth(), height_cm=170, weight_kg=68, bio="Regular hydration user."))

        for owner in [admin, user]:
            for _ in range(5):
                db.session.add(WaterLog(user_id=owner.id, amount_ml=fake.random_int(min=250, max=1000)))
            db.session.add(Goal(user_id=owner.id, daily_target_ml=fake.random_int(min=1800, max=2500)))
            for _ in range(3):
                db.session.add(Reminder(user_id=owner.id, message=fake.sentence(nb_words=6), remind_at=fake.future_datetime()))
            for _ in range(3):
                db.session.add(Activity(user_id=owner.id, activity_type=fake.word(), duration_minutes=fake.random_int(min=10, max=90)))

        courses = []
        for i in range(4):
            course = Course(name=fake.word().title() + " Course", description=fake.sentence())
            db.session.add(course)
            courses.append(course)

        db.session.commit()

        db.session.add(Enrollment(user_id=admin.id, course_id=courses[0].id, grade="A"))
        db.session.add(Enrollment(user_id=user.id, course_id=courses[0].id, grade="B"))
        db.session.add(Enrollment(user_id=user.id, course_id=courses[1].id, grade="A-"))

        db.session.commit()

        print("Seeded database with admin/user, profile, logs, goals, reminders, activities, courses, enrollments")


if __name__ == "__main__":
    seed_data()
