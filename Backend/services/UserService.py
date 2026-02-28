from models.User import User
from models.PublicInformation import PublicInformation

#from user_repository import UserRepository //yet to create UserRepository


class UserService:
    def __init__(self, repo: UserRepository):
        self.__user_repo = repo

    

    def update_public_profile(self, user: User, public_info: PublicInformation) -> User:
        user.get_public_info().set_username(public_info.get_username())
        user.get_public_info().set_bio(public_info.get_bio())
        self.__user_repo.save(user)
        return user