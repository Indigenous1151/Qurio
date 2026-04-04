from FriendRepository import FriendRepository
from models.FriendRequest import FriendRequest

class FriendService:
    def __init__(self, friend_repo: FriendRepository, user_repo):
        self.__friend_repo = friend_repo
        self.__user_repo = user_repo

    # def send_friend_request(self, sender_id: str, receiver_id: str) -> bool:
    #     request = FriendRequest(sender_id=sender_id, receiver_id=receiver_id)
    #     return self.__friend_repo.save_request(request)
    
    def send_friend_request(self, sender_id: str, receiver_id: str) -> bool:
        request = FriendRequest(sender_id=sender_id, receiver_id=receiver_id)
        request.status = "accepted"  # auto accept
        return self.__friend_repo.save_request(request)

    def accept_friend_request(self, sender_id: str, receiver_id: str) -> bool:
        return self.__friend_repo.update_status(sender_id, receiver_id, "accepted")

    def decline_friend_request(self, sender_id: str, receiver_id: str) -> bool:
        return self.__friend_repo.update_status(sender_id, receiver_id, "declined")

    def get_friends_list(self, user_id: str) -> list:
        return self.__friend_repo.get_friends_list(user_id)

    def get_pending_requests(self, user_id: str) -> list:
        return self.__friend_repo.get_pending_requests(user_id)

    def remove_friend(self, user_id: str, friend_id: str) -> bool:
        return self.__friend_repo.delete_friendship(user_id, friend_id)

    def search_user(self, query: str, search_type: str) -> list:
        if search_type == "email":
            return self.__user_repo.search_by_email(query)
        return self.__user_repo.search_by_username(query)