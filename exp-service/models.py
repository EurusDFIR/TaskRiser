from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Task model
class Task(db.Model):
    __tablename__ = 'task'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='Pending')
    difficulty = db.Column(db.String(50), default='E-Rank')
    priority = db.Column(db.String(50), default='Medium')
    due_date = db.Column(db.Date, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    exp_reward = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'difficulty': self.difficulty,
            'priority': self.priority,
            'dueDate': self.due_date.isoformat() if self.due_date else None,
            'userId': self.user_id,
            'expReward': self.exp_reward,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    total_exp = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, nullable=False)
    avatar = db.Column(db.Text, nullable=True)  

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'totalExp': self.total_exp,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'avatar': self.avatar or ""
        }
