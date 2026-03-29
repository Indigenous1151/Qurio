import uuid

class FriendRequest:
    def __init__(self, sender_id: str, receiver_id: str):
        self.request_id = str(uuid.uuid4())
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.status = "pending"

    def is_accepted(self) -> bool:
        return self.status == "accepted"

    def is_declined(self) -> bool:
        return self.status == "declined"

    def to_dict(self) -> dict:
        return self.__dict__