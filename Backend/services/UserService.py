from models.PublicInformation import PublicInformation
from UserRepository import UserRepository


class UserService:
    def __init__(self, repo: UserRepository):
        self.__repo = repo

    def update_public_profile(self, user_id: str, username: str, bio: str = '') -> PublicInformation:
        public_info = PublicInformation(
            user_id=user_id,
            username=username,
            bio=bio
        )
        success = self.__repo.save(public_info)
        if not success:
            raise Exception("Failed to update public profile")
        return public_info