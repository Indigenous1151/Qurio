from GroupRepository import GroupRepository
from models.Group import Group
from models.GroupInvite import GroupInvite

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

    def get_group(self, group_id: str) -> dict:
        group = self.__repo.get_group(group_id)
        if not group:
            raise Exception("Group not found")
        return group

    def invite_user(self, group_id: str, invited_by: str, username: str) -> bool:
        results = self.__user_repo.search_by_username(username)
        if not results:
            raise Exception(f"User '{username}' not found")
        receiver_id = results[0]["user_id"]
        invite = GroupInvite(
            group_id=group_id,
            invited_by=invited_by,
            invited_user=receiver_id
        )
        return self.__repo.save_invite(invite)

    def get_pending_invites(self, user_id: str) -> list:
        return self.__repo.get_pending_invites(user_id)

    def accept_invite(self, invite_id: str, user_id: str) -> bool:
        invites = self.__repo.get_pending_invites(user_id)
        print(f"Invites: {invites}")
        invite = next((i for i in invites if i["invite_id"] == invite_id), None)
        print(f"Found invite: {invite}")
        if not invite:
            raise Exception("Invite not found")
        self.__repo.update_invite_status(invite_id, "accepted")
        return self.__repo.add_member(invite["group_id"], user_id)

    def decline_invite(self, invite_id: str) -> bool:
        return self.__repo.update_invite_status(invite_id, "declined")