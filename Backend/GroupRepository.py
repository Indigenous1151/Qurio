from database.SupabaseClient import SupabaseClient
from models.Group import Group

class GroupRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def save_group(self, group: Group) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("groups").insert({
                "group_id": group.group_id,
                "group_name": group.group_name,
                "description": group.description,
                "owner_id": group.owner_id,
                "members": group.members,
                "invite_code": group.invite_code,
                "status": group.status
            }).execute()
            return True
        except Exception as e:
            print(f"Error saving group: {e}")
            return False
    def get_user_groups(self, user_id: str) -> list:
        try:
            client = self.__db_client.get_client()
            result = client.table("groups").select("*").contains(
                "members", [user_id]
            ).execute()
            return result.data
        except Exception as e:
            print(f"Error getting user groups: {e}")
            return []

    # def get_group(self, group_id: str) -> dict:
    #     try:
    #         client = self.__db_client.get_client()
    #         result = client.table("groups").select("*").eq(
    #             "group_id", group_id
    #         ).single().execute()
    #         return result.data
    #     except Exception as e:
    #         print(f"Error getting group: {e}")
    #         return {}

    