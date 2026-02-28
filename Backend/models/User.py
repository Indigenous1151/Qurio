

class PublicInformation:
    def __init__(self, username: str, bio: str):
        self.__username = username
        self.__bio = bio

    def get_username(self) -> str:
        return self.__username

    def set_username(self, username: str) -> None:
        self.__username = username

    def get_bio(self) -> str:
        return self.__bio

    def set_bio(self, bio: str) -> None:
        self.__bio = bio


class User:
    def __init__(self,  public_info: PublicInformation):
        
        self.__public_info = public_info

    

    def get_public_info(self) -> PublicInformation:
        return self.__public_info