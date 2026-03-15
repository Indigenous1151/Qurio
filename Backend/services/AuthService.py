from models.PersonalInformation import PersonalInformation
from models.PublicInformation import PublicInformation
from models.User import User
from UserRepository import UserRepository


class AuthService:
    def __init__(self, repo: UserRepository):
        self.__repo = repo

    def create_account(self, username: str, email:str, password: str) -> User:
        user_id = self.__repo.create_auth_user(username, email, password)

        personal_info = PersonalInformation(
            user_id=user_id,
            full_name="",
            email=email
        )

        public_info = PublicInformation(
            user_id=user_id,
            username=username,
            bio=""
        )

        return User(personal_info, public_info)

    def login(self, email: str, password: str) -> User:
        user = self.__repo.login(email, password)

        user_id = user.id

        personal = PersonalInformation(
            user_id=user_id,
            full_name=user.user_metadata.get("full_name", ""),
            email=user.email
        )

        public_data = __repo.get_public_profile(user_id)

        public_info = PublicInformation(
            user_id=user_id,
            username=public_data["username"],
            bio=public_data["bio"]
        )

        return User(personal_info=personal, public_info=public)

    def signout(self):
        pass

    def forgot_password(self, email: str):
        pass