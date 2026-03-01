class PersonalInformation:
    def __init__(self,full_name,email,user_id):
        self.full_name = full_name
        self.email = email
        self.user_id = user_id
    def get_fill_name(self) -> str:
        return self.__full_name

    def set_full_name(self,name: str)-> None:
        self.__full_name = name
    
    def get_email(self) -> str:
        return self.__email
    
    def set_email(self,email: str) -> None:
        self.__email = email
    
    def get_user_id(self) -> int:
        return self.__user_id
    
    def set_user_id(self,user_id: int) -> None:
        self.__user_id = user_id
    
    