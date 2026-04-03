import uuid

class Group:
    def __init__(self, group_name: str, owner_id: str, description: str = ""):
        self.group_id = str(uuid.uuid4())
        self.group_name = group_name
        self.description = description
        self.owner_id = owner_id
        self.members = [owner_id]
        self.invite_code = str(uuid.uuid4())[:8].upper()
        self.status = "active"

    def get_group_id(self) -> str:
        return self.group_id

    def get_group_name(self) -> str:
        return self.group_name

    def get_members(self) -> list:
        return self.members

    def add_member(self, user_id: str) -> None:
        if user_id not in self.members:
            self.members.append(user_id)

    

    def generate_invite_code(self) -> str:
        return self.invite_code

    def to_dict(self) -> dict:
        return self.__dict__