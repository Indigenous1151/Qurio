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

    def get_public_profile(self, user_id: str) -> dict:
        """
        Function to query database and get row matching user_id.

        Returns:
            dict containing columns id, user_id, username, bio, created_at, updated_at
        """
        client = self.__db_client.get_client()

        result = (
            client.table("public_profile")
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise Exception("Unable to get public profile data")

        return result.data

    def create_auth_user(self, username: str, email: str, password: str) -> str:
        """
        Function called to create a new user in the supabase database.

        Returns:
            user_id of created user.

        """
        client = self.__db_client.get_client()

        response = client.auth.sign_up({
            "email": email,
            "password": password
        })

        if not response:
            raise Exception("Failed to create user")

        user_id = response.user.id

        reuslt = client.table("public_profile").insert({
            "user_id": user_id,
            "username": username,
            "bio": ""
        }).execute()

        if not result:
            raise Exception("Failed to create public profile")

        return user_id

    def login(self, email: str, password: str):
        client = self.__db_client.get_client()

        response = client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not response.user:
            raise Exception("Invalid email or password")

        return response.user

    def sign_out(self) -> bool:
        client = self.__db_client.get_client()

        response = client.auth.sign_out()

        if response.error:
            raise Exception("Failed to sign out")

        return True