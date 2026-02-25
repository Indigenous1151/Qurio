class PublicInformation:
    def __init__(self, username:str,bio:str):
        self.__username: str = username
        self.__bio: str = bio
    
    def get_username(self) -> str:
        return self.__username
    def set_username(self, username: str)-> None:
        self.__username = username
    def get_bio(self) ->str:
        return self.__bio
    def set_bio(self, bio: str) -> None:
        self.__bio = bio
    

