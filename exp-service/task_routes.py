
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Task
from datetime import datetime

task_bp = Blueprint('task', __name__)

@task_bp.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.id.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@task_bp.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    difficulty = data.get('difficulty')
    status = data.get('status', 'Pending')
    description = data.get('description')
    due_date = datetime.fromisoformat(data['dueDate']).date() if data.get('dueDate') else None
    priority = data.get('priority', 'Medium')
    exp_reward = 0
    if difficulty == 'E-Rank': exp_reward = 10
    elif difficulty == 'D-Rank': exp_reward = 20
    elif difficulty == 'C-Rank': exp_reward = 30
    elif difficulty == 'B-Rank': exp_reward = 40
    elif difficulty == 'A-Rank': exp_reward = 50
    elif difficulty == 'S-Rank': exp_reward = 100
    task = Task(
        title=title,
        description=description,
        status=status,
        difficulty=difficulty,
        priority=priority,
        due_date=due_date,
        user_id=user_id,
        exp_reward=exp_reward
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201

@task_bp.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.difficulty = data.get('difficulty', task.difficulty)
    task.priority = data.get('priority', task.priority)
    if data.get('dueDate'):
        task.due_date = datetime.fromisoformat(data['dueDate']).date()
    db.session.commit()
    return jsonify(task.to_dict())

@task_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})

