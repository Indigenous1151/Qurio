from models.User import User
from models.PersonalInformation import PersonalInformation

#from user_repository import UserRepository //yet to create UserRepository


class UserService:
    def __init__(self, repo: UserRepository):
        self.__user_repo = repo

    

    def update_personal_information(self, user: User, personal_info: PersonalInformation) -> User:
        user.get_personal_info().set_full_name(personal_info.get_full_name())
        user.get_personal_info().set_email(personal_info.get_email())
        self.__user_repo.save(user)
        return user
