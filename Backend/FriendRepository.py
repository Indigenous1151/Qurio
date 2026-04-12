from database.SupabaseClient import SupabaseClient
from models.FriendRequest import FriendRequest
class FriendRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client
    

    def update_status(self,sender_id: str,receiver_id:str,status:str) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("friend_requests").update({
                "status": status
            }).eq("sender_id", sender_id).eq("receiver_id", receiver_id).execute()
            return True
        except Exception as e:
                print(f"Error updating friend request: {e}")
                return False
    
    def save_request(self, req: FriendRequest) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("friend_requests").insert({
                "request_id": req.request_id,
                "sender_id": req.sender_id,
                "receiver_id": req.receiver_id,
                "status": req.status
            }).execute()
            return True
        except Exception as e:
            if "unique_friend_request" in str(e):
                print("Already friends!")
                return False
            print(f"Error saving friend request: {e}")
            return False

    def get_friends_list(self, user_id: str) -> list:
        try:
            client = self.__db_client.get_client()
            result = client.table("friend_requests").select("*").eq(
                "status", "accepted"
            ).or_(f"sender_id.eq.{user_id},receiver_id.eq.{user_id}").execute()
            return result.data
        except Exception as e:
            print(f"Error getting friends: {e}")
            raise e  

    def get_pending_requests(self, user_id: str) -> list:
        try:
            client = self.__db_client.get_client()
            result = client.table("friend_requests").select("*").eq(
                "receiver_id", user_id
            ).eq("status", "pending").execute()
            return result.data
        except Exception as e:
            print(f"Error getting pending requests: {e}")
            return []
    def delete_friendship(self, user_id: str, friend_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("friend_requests").delete().or_(
                f"and(sender_id.eq.{user_id},receiver_id.eq.{friend_id}),"
                f"and(sender_id.eq.{friend_id},receiver_id.eq.{user_id})"
            ).execute()
            return True
        except Exception as e:
            print(f"Error removing friend: {e}")
            return False