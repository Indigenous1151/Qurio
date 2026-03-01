from abc import ABC, abstractmethod
from supabase import create_client
import os
from dotenv import load_dotenv

class DBConnection(ABC):
    def __init__(self, url: str, username: str, password: str):
        self._url = url
        self._username = username
        self._password = password
        self._is_connected: bool = False

    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def disconnect(self) -> None:
        pass

    @abstractmethod
    def execute_query(self, query: str) -> bool:
        pass


class SupabaseClient(DBConnection):
    def __init__(self, url: str, key: str):
        super().__init__(url=url, username="", password=key)
        self._client = None

    def connect(self) -> None:
        
        load_dotenv()
        self._client = create_client(self._url, self._password)
        self._is_connected = True

    def disconnect(self) -> None:
        self._client = None
        self._is_connected = False

    def execute_query(self, query: str) -> bool:
        try:
            if self._client:
                self._client.rpc(query).execute()
                return True
            return False
        except Exception:
            return False

    def get_client(self):
        return self._client