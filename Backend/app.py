from flask import Flask
from dotenv import load_dotenv
import os

from database.supabaseClient import SupabaseClient
from UserRepository import UserRepository
from services.UserService import UserService
from controllers.UserController import UserController, user_bp


load_dotenv()

app = Flask(__name__)

supabase = SupabaseClient(
    url=os.getenv("SUPABASE_URL"),
    key=os.getenv("SUPABASE_SERVICE_KEY")
)
supabase.connect()

user_repo = UserRepository(db_client=supabase)
user_service = UserService(repo=user_repo)

UserController(service=user_service)

app.register_blueprint(user_bp)


if __name__ == '__main__':
    app.run(debug=True)