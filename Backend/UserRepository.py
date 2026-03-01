from database.supabaseClient import SupabaseClient
from models.PublicInformation import PublicInformation


class UserRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def save(self, public_info: PublicInformation) -> bool:
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