from models.PersonalInformation import PersonalInformation
from models.PublicInformation import PublicInformation
from models.User import User
from UserRepository import UserRepository


class UserService:
    def __init__(self, repo: UserRepository):
        self.__repo = repo

    def update_personal_information(self, user_id: str, full_name: str, email: str) -> PersonalInformation:
        personal_info = PersonalInformation(
            user_id=user_id,
            full_name=full_name,
            email=email
        )
        success = self.__repo.save_personal_info(personal_info)
        if not success:
            raise Exception("Failed to update personal information")
        return personal_info

    def update_public_profile(self, user_id: str, username: str, bio: str, currency: int) -> PublicInformation:
        public_info = PublicInformation(
            user_id=user_id,
            username=username,
            bio=bio,
            currency=currency

        )
        success = self.__repo.save_public_info(public_info)
        if not success:
            raise Exception("Failed to update public profile")
        return public_info
