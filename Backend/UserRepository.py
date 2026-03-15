from database.SupabaseClient import SupabaseClient
from models.PersonalInformation import PersonalInformation


class UserRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def save(self, personal_info: PersonalInformation) -> bool:
        try:
            client = self.__db_client.get_client()
            client.auth.admin.update_user_by_id(
                personal_info.get_user_id(),
                {"user_metadata": {"display_name": personal_info.get_full_name()},
                 "email": personal_info.get_email()}
            )
            return True
        except Exception as e:
            print(f"Error saving personal info: {e}")
            return False
        
    
