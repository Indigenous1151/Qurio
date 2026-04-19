from GroupRepository import GroupRepository
from models.Group import Group
from models.GroupInvite import GroupInvite
from services.TriviaService import TriviaService
from typing import Any

class GroupService:
    def __init__(self, group_repo: GroupRepository, user_repo, trivia_service: TriviaService):
        self.__group_repo = group_repo
        self.__user_repo = user_repo
        self.__trivia_service = trivia_service

    def create_group(self, user_id: str, group_name: str, description: str = "") -> Group:
        group = Group(group_name=group_name, owner_id=user_id, description=description)
        success = self.__group_repo.save_group(group)
        if not success:
            raise Exception("Failed to create group")
        return group

    def get_user_groups(self, user_id: str) -> list:
        return self.__group_repo.get_user_groups(user_id)


    def join_group(self, invite_code: str, user_id: str) -> bool:
        # get invite data from GroupRepository
        group = self.__group_repo.get_group_by_invite_code(invite_code)

        if not group:
            raise Exception("Invalid invite code")

        group_id = group[0]["group_id"]

        membership = self.__group_repo.add_user_to_group(group_id, user_id)

        if not membership:
            raise Exception("Failed to join group")

        self.__group_repo.mark_invite_used(invite_code)

        return True

    def leave_group(self, group_id: str, user_id: str) -> bool:
        """Remove user from a group"""
        membership = self.__group_repo.remove_user_from_group(group_id, user_id)

        if not membership:
            raise Exception("Failed to leave group")

        return True

    def get_group(self, group_id: str) -> dict:
        group = self.__group_repo.get_group(group_id)
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
        return self.__group_repo.save_invite(invite)

    def get_pending_invites(self, user_id: str) -> list:
        return self.__group_repo.get_pending_invites(user_id)

    def accept_invite(self, invite_id: str, user_id: str) -> bool:
        invites = self.__group_repo.get_pending_invites(user_id)
        print(f"Invites: {invites}")
        invite = next((i for i in invites if i["invite_id"] == invite_id), None)
        print(f"Found invite: {invite}")
        if not invite:
            raise Exception("Invite not found")
        self.__group_repo.update_invite_status(invite_id, "accepted")
        return self.__group_repo.add_member(invite["group_id"], user_id)

    def decline_invite(self, invite_id: str) -> bool:
        return self.__group_repo.update_invite_status(invite_id, "declined")

    def create_game(self, game_data: dict[str, Any]):
        # use trivia service fetch_questions call to get questions
        question_params = game_data.get("game_params", {})
        amount = question_params.get("amount", 10)
        category = question_params.get("category")
        difficulty = question_params.get("difficulty")

        question_data = self.__trivia_service.fetch_questions(amount, category, difficulty)
        if not question_data:
            raise Exception("Failed to fetch questions for the group game")

        # pass questions to create_game along with game_data
        return self.__group_repo.create_game(game_data, question_data)