class AuthService:
    def create_account(self, username: str, email:str, password: str) -> User:
        user_id = self.__repo.create_auth_user

    def login(self, email: str, password: str) -> User:
        pass

    def signout(self):
        pass

    def forgot_password(self, email: str):
        pass