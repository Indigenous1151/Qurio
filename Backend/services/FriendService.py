from FriendRepository import FriendRepository
from models.FriendRequest import FriendRequest
from services.EmailService import EmailService
import os
from supabase import create_client

class FriendService:
    def __init__(self, friend_repo: FriendRepository, user_repo):
        self.__friend_repo = friend_repo
        self.__user_repo = user_repo
        self.__email_service = EmailService()

    def accept_friend_request(self, sender_id: str, receiver_id: str) -> bool:
        return self.__friend_repo.update_status(sender_id, receiver_id, "accepted")

    def decline_friend_request(self, sender_id: str, receiver_id: str) -> bool:
        return self.__friend_repo.update_status(sender_id, receiver_id, "declined")


    def send_friend_request(self, sender_id: str, receiver_id: str) -> bool:
        request = FriendRequest(sender_id=sender_id, receiver_id=receiver_id)
        saved = self.__friend_repo.save_request(request)

        if saved:
            try:
                client = create_client(
                    os.getenv("SUPABASE_URL"),
                    os.getenv("SUPABASE_SECRET_KEY")
                )
                receiver = client.auth.admin.get_user_by_id(receiver_id)
                receiver_email = receiver.user.email

                sender_profile = self.__user_repo.search_by_username_exact(sender_id)
                sender_username = sender_profile.get("username", "Someone")

                self.__email_service.send_friend_request_email(receiver_email, sender_username,sender_id,receiver_id)

            except Exception as e:
                print(f"Email notification failed: {e}")
            return saved
    def get_friends_list(self, user_id: str) -> list:
        return self.__friend_repo.get_friends_list(user_id)
            
    def remove_friend(self, user_id: str, friend_id: str) -> bool:
        return self.__friend_repo.delete_friendship(user_id, friend_id)

        