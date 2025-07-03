from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User,db
from datetime import datetime

user_bp = Blueprint('user', __name__)


# Hỗ trợ GET (lấy profile) và PUT (cập nhật profile) trên cùng endpoint /api/users/me
@user_bp.route('/api/users/me', methods=['GET', 'PUT'])
@jwt_required()
def user_profile():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if request.method == 'GET':
        return jsonify(user.to_dict())
    elif request.method == 'PUT':
        data = request.get_json()
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'avatar' in data:
            user.avatar = data['avatar']
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()})


# Cập nhật profile bằng PUT, cho phép cập nhật tên và ảnh đại diện
@user_bp.route('/api/users/update-profile', methods=['PUT', 'POST'])
@jwt_required()
def update_user_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    # Cập nhật tên
    if 'username' in data:
        user.username = data['username']
    # Cập nhật email (nếu có)
    if 'email' in data:
        user.email = data['email']
    # Cập nhật ảnh đại diện (avatar)
    if 'avatar' in data:
        user.avatar = data['avatar']
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()})

@user_bp.route('/api/users/update-exp', methods=['POST'])
@jwt_required()
def update_user_exp():
    user_id = get_jwt_identity()
    data = request.get_json()
    exp = data.get('exp')
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if exp is not None:
        user.total_exp = exp
        db.session.commit()
    return jsonify({'message': 'EXP updated successfully', 'user': user.to_dict()})


# Alias: /api/users/register (proxy for /api/auth/register)
from flask import current_app
import requests

@user_bp.route('/api/users/register', methods=['POST'])
def register_user_alias():
    # Forward the request to /api/auth/register internally
    data = request.get_json()
    # Gọi trực tiếp hàm register của auth_bp nếu muốn, hoặc forward HTTP nội bộ
    # Ở đây dùng HTTP request nội bộ để giữ nguyên logic
    url = request.host_url.rstrip('/') + '/api/auth/register'
    resp = requests.post(url, json=data)
    return (resp.content, resp.status_code, resp.headers.items())
