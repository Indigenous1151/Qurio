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

    def get_group(self, group_id: str) -> dict:
        try:
            client = self.__db_client.get_client()
            result = client.table("groups").select("*").eq(
                "group_id", group_id
            ).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]
            return {}
        except Exception as e:
            print(f"Error getting group: {e}")
            return {}

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

    def save_invite(self, invite) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("group_invites").insert({
                "invite_id": invite.invite_id,
                "group_id": invite.group_id,
                "invited_by": invite.invited_by,
                "invited_user": invite.invited_user,
                "status": invite.status
            }).execute()
            return True
        except Exception as e:
            print(f"Error saving invite: {e}")
            return False

    def get_pending_invites(self, user_id: str) -> list:
        try:
            client = self.__db_client.get_client()
            result = client.table("group_invites").select("*, groups(group_name)").eq(
                "invited_user", user_id
            ).eq("status", "pending").execute()
            return result.data
        except Exception as e:
            print(f"Error getting pending invites: {e}")
            return []

    def update_invite_status(self, invite_id: str, status: str) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("group_invites").update({
                "status": status
            }).eq("invite_id", invite_id).execute()
            return True
        except Exception as e:
            print(f"Error updating invite: {e}")
            return False

    def add_member(self, group_id: str, user_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            group = self.get_group(group_id)  
            if not group:
                raise Exception("Group not found")
            members = group["members"]
            if user_id not in members:
                members.append(user_id)
            client.table("groups").update({
                "members": members
            }).eq("group_id", group_id).execute()
            return True
        except Exception as e:
            print(f"Error adding member: {e}")
            return False