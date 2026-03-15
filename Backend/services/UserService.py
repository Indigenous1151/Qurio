from models.PersonalInformation import PersonalInformation
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
        success = self.__repo.save(personal_info)
        if not success:
            raise Exception("Failed to update personal information")
        return personal_info