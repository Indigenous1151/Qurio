from supabase import create_client
from dotenv import load_dotenv

load_dotenv()


class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.__url = url
        self.__key = key
        self.__client = None

    def connect(self) -> None:
        self.__client = create_client(self.__url, self.__key)

    def disconnect(self) -> None:
        self.__client = None

    def get_client(self):
        return self.__client