from flask import Flask
from dotenv import load_dotenv
import os
from flask_cors import CORS
from database.SupabaseClient import SupabaseClient
from UserRepository import UserRepository
from services.UserService import UserService
from controllers.UserController import UserController, user_bp

load_dotenv()

app = Flask(__name__)
CORS(app) 

supabase = SupabaseClient(
    url=os.getenv("SUPABASE_URL"),
    key=os.getenv("SUPABASE_SECRET_KEY")
)
supabase.connect()

# Repository Creation
user_repo = UserRepository(db_client=supabase)

# Service Creation
user_service = UserService(repo=user_repo)
auth_service = AuthService(repo=user_repo)

# Controller Creation
UserController(service=user_service)
AuthController(service=auth_service)

app.register_blueprint(user_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True)
