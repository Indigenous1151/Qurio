from GroupRepository import GroupRepository
from models.Group import Group

class GroupService:
    def __init__(self, repo: GroupRepository, user_repo):
        self.__repo = repo
        self.__user_repo = user_repo

    def create_group(self, user_id: str, group_name: str, description: str = "") -> Group:
        group = Group(group_name=group_name, owner_id=user_id, description=description)
        success = self.__repo.save_group(group)
        if not success:
            raise Exception("Failed to create group")
        return group

    
    
    def get_user_groups(self, user_id: str) -> list:
        return self.__repo.get_user_groups(user_id)