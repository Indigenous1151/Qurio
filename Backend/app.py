from dotenv import load_dotenv
load_dotenv(dotenv_path='.env', verbose=True)
from flask import Flask

import os
import jwt
from jwt import PyJWKClient
import requests
from flask_cors import CORS
from database.MongoDBClient import MongoDBClient
from database.SupabaseClient import SupabaseClient
from UserRepository import UserRepository
from services.TriviaService import TriviaService
from GameRepository import GameRepository
from GroupRepository import GroupRepository
from QuestionRepository import QuestionRepository
from services.UserService import UserService
from services.GroupService import GroupService
from services.AuthService import AuthService
from services.GameService import GameService
from services.PaymentService import PaymentService
from controllers.UserController import UserController, user_bp
from controllers.AuthController import AuthController, auth_bp
from controllers.GameController import GameController, game_bp
from controllers.GroupController import GroupController,group_bp
from controllers.FriendController import FriendController, friend_bp
from controllers.PaymentController import PaymentController, payment_bp
from controllers.StatisticsController import statistics_bp
from services.FriendService import FriendService
from FriendRepository import FriendRepository
from PaymentRepository import PaymentRepository




app = Flask(__name__)
CORS(app, 
     resources={r"/*": {"origins": "http://localhost:5173"}},
     allow_headers="*",
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

# Setup JWKS client for JWT verification
supabase_url = os.getenv("SUPABASE_URL")
jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
jwk_client = PyJWKClient(jwks_url)

def get_user_id_from_request(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.replace('Bearer ', '')
    try:
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, signing_key.key, algorithms=['ES256'], audience='authenticated')
        return payload['sub']
    except Exception as e:
        print(f"JWT decode error: {e}")
        return None

supabase = SupabaseClient(
    url=os.getenv("SUPABASE_URL", ""),
    key=os.getenv("SUPABASE_SECRET_KEY", "")
)
print(f"Key: {os.getenv('SUPABASE_SECRET_KEY', "")[:30]}")
mongo = MongoDBClient()
#Database connections
supabase.connect()
mongo.connect()

app.config["SUPABASE"] = supabase

# Repository Creation
user_repo = UserRepository(db_client=supabase)
game_repo = GameRepository(db_client=mongo)
question_repo = QuestionRepository(db_client=mongo)
friend_repo = FriendRepository(db_client=supabase)
group_repo = GroupRepository(db_client=supabase)
payment_repo = PaymentRepository(db_client=supabase)


# Service Creation
user_service = UserService(repo=user_repo)
friend_service = FriendService(friend_repo=friend_repo,user_repo=user_repo)
auth_service = AuthService(repo=user_repo)
trivia_service = TriviaService()
group_service = GroupService(repo = group_repo,user_repo=user_repo)
game_service = GameService(
    question_repo=question_repo,
    game_repo=game_repo,
    trivia_service=trivia_service
)
payment_service = PaymentService(repo = payment_repo)

# Controller Creation
UserController(service=user_service, get_user_id_func=get_user_id_from_request)
AuthController(service=auth_service, get_user_id_func=get_user_id_from_request)
GameController(game_service=game_service, get_user_id_func=get_user_id_from_request)
FriendController(service=friend_service)
GroupController(service=group_service)
PaymentController(service=payment_service)

app.register_blueprint(user_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(friend_bp)
app.register_blueprint(game_bp)
app.register_blueprint(group_bp)
app.register_blueprint(statistics_bp)
app.register_blueprint(payment_bp)

if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True, port=5001)
