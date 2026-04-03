from models.PersonalInformation import PersonalInformation
from models.PublicInformation import PublicInformation
from models.Statistics import Statistics


class User:
    def __init__(self, personal_info: PersonalInformation, public_info: PublicInformation, statistics: Statistics = None):
        self.__personal_info = personal_info
        self.__public_info = public_info
        self.__statistics = statistics

    def get_personal_info(self) -> PersonalInformation:
        return self.__personal_info

    def get_public_info(self) -> PublicInformation:
        return self.__public_info
    
    def get_statistics(self) -> Statistics:
        return self.__statistics

    def set_statistics(self, statistics: Statistics) -> None:
        self.__statistics = statistics