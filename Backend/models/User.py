from PersonalInformation import PersonalInformation


class User:
    def __init__(self, personal_info: PersonalInformation):
        self.__personal_info: PersonalInformation = personal_info
        

    def get_personal_info(self)->PersonalInformation:
        return self.__personal_info

    

