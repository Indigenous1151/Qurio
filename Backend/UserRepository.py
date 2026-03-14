from database.SupabaseClient import SupabaseClient
from models.PersonalInformation import PersonalInformation
from models.PublicInformation import PublicInformation
from models.User import User


class UserRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def save_personal_info(self, personal_info: PersonalInformation) -> bool:
        try:
            client = self.__db_client.get_client()
            print(f"Updating user with id: {personal_info.get_user_id()}")
            client.auth.admin.update_user_by_id(
                personal_info.get_user_id(),
                {"user_metadata": {"display_name": personal_info.get_full_name()},
                "email": personal_info.get_email()}
            )
            return True
        except Exception as e:
            print(f"Error saving personal info: {e}")
            raise e  # temporarily raise to see full error

    def save_public_info(self, public_info: PublicInformation) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("public_profile").upsert({
                "user_id": public_info.get_user_id(),
                "username": public_info.get_username(),
                "bio": public_info.get_bio()
            }, on_conflict="user_id").execute()
            return True
        except Exception as e:
            print(f"Error saving public info: {e}")
            return False

    def create_auth_user(self, username: str, email: str, password: str) -> str:

        response = self.__db_client.auth.sign_up({
            "email": email,
            "password": password
        })

        if not response:
            raise Exception("Failed to create user")

        user_id = response.user.id

        result = self.__db_client.table("public_profile").insert({
            "user_id": user_id,
            "username": username,
            "bio": ""
        }).execute()

        if not result:
            raise Exception("Failed to create public profile")

        return user_id
