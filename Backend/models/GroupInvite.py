import uuid

class GroupInvite:
    def __init__(self, group_id: str, invited_by: str, invited_user: str):
        self.invite_id = str(uuid.uuid4())
        self.group_id = group_id
        self.invited_by = invited_by
        self.invited_user = invited_user
        self.status = "pending"

    def to_dict(self) -> dict:
        return self.__dict__