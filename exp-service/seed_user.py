from app import app
from extensions import db
from models import User
from datetime import datetime

with app.app_context():
    if not User.query.filter_by(email='admin@example.com').first():
        user = User(
            username='admin',
            email='admin@example.com',
            created_at=datetime.utcnow()
        )
        user.set_password('admin123')
        db.session.add(user)
        db.session.commit()
        print("Seeded admin user!")
    else:
        print("Admin user already exists.")
