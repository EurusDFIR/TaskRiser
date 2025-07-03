from flask import Flask
from extensions import db, jwt
from user_routes import user_bp
from auth_routes import auth_bp
from flask_migrate import Migrate
app = Flask(__name__)

migrate = Migrate(app, db)

# Cấu hình kết nối PostgreSQL và JWT secret
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:eurus@localhost:5432/taskriser_exp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'c07b94d965ca7d19562c5e87ce5f91c6e86602fa60a6544e98902e26e608968cddb7014e27ab6dc4102c94daf1e4655675679405a3eb0f73f82b027da7939552385605d84f84d3babf4ad335a3ea36a10364a91958fcff5399ceac4394b6e6b92eb7d669017a178be845d9c7a949b31f5d048918f633da21f8533866eecbfc4e98c1d8599218a27d9711cc711b9f7d01ee48b91e185ebd8f6ef8a11dd09223f6972b8aeefa537c64bbf3f1097ca656ee73ae43ead02b2804b32e87ce34f3af7993a0ba3ca2838042a02a4b76358a6fd48216d58ffa2223af7097dba6c7e89c94ab8ff3214682856942d37a902db48770d1291e4684dbb2ae6e9dbbe4b821dd3e'


db.init_app(app)
jwt.init_app(app)

# --- JWT error handlers for debugging ---
from flask import jsonify
from flask_jwt_extended import JWTManager

@jwt.unauthorized_loader
def unauthorized_callback(callback):
    print("[JWT] Unauthorized:", callback)
    return jsonify({"msg": "Missing or invalid JWT"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(callback):
    print("[JWT] Invalid token:", callback)
    return jsonify({"msg": "Invalid JWT"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("[JWT] Token expired")
    return jsonify({"msg": "Token expired"}), 401

from task_routes import task_bp
app.register_blueprint(user_bp)
app.register_blueprint(task_bp)
app.register_blueprint(auth_bp)

@app.route('/')
def hello_world():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)