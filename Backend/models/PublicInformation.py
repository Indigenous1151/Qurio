class PublicInformation:
    def __init__(self, user_id: str, username: str, bio: str):
        self.__user_id = user_id
        self.__username = username
        self.__bio = bio

    def get_user_id(self) -> str:
        return self.__user_id

    def get_username(self) -> str:
        return self.__username

    def set_username(self, username: str) -> None:
        self.__username = username

    def get_bio(self) -> str:
        return self.__bio

    def set_bio(self, bio: str) -> None:
        self.__bio = bio