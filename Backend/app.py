from dotenv import load_dotenv
load_dotenv(dotenv_path='.env', verbose=True)
from flask import Flask

import os
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
from controllers.UserController import UserController, user_bp
from controllers.AuthController import AuthController, auth_bp
from controllers.GameController import GameController, game_bp
from controllers.GroupController import GroupController,group_bp
from controllers.FriendController import FriendController, friend_bp
from controllers.StatisticsController import statistics_bp
from services.FriendService import FriendService
from FriendRepository import FriendRepository



app = Flask(__name__)
CORS(app, 
     resources={r"/*": {"origins": "http://localhost:5173"}},
     allow_headers=["Content-Type", "X-User-Id"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True)

supabase = SupabaseClient(
    url=os.getenv("SUPABASE_URL"),
    key=os.getenv("SUPABASE_SECRET_KEY")
)
print(f"Key: {os.getenv('SUPABASE_SECRET_KEY')[:30]}")
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

# Controller Creation
UserController(service=user_service)
AuthController(service=auth_service)
GameController(game_service = game_service)
FriendController(service=friend_service)
GroupController(service=group_service)

app.register_blueprint(user_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(friend_bp)
app.register_blueprint(game_bp)
app.register_blueprint(group_bp)
app.register_blueprint(statistics_bp)

if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True, port=5001)
