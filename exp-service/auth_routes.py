from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import db
from models import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token, 'user': user.to_dict()})

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'Username or email already exists'}), 409
    user = User(username=username, email=email, created_at=datetime.utcnow())
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Đã loại bỏ đồng bộ user sang task_service (đã hợp nhất backend)
    return jsonify({'message': 'User registered successfully'})

@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    # TODO: Xử lý đăng nhập Google
    return jsonify({"message": "Google Auth endpoint (to be implemented)"})
