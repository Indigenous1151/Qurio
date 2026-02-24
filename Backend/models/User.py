from PersonalInformation import PersonalInformation
from PublicInformation import PublicInformation

class User:
    def __init__(self, personal_info: PersonalInformation,public_info: PublicInformation):
        self.__personal_info: PersonalInformation = personal_info
        self.__public_info:PublicInformation = public_info

    def get_personal_info(self)->PersonalInformation:
        return self.__personal_info

    def get_public_info(self)-> PublicInformation:
        return self.__public_info

