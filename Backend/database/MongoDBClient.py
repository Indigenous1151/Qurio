from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os

class MongoDBClient:
    def __init__(self):
        self.__uri = os.getenv("MONGO_URI")
        self.__client = None
        self.__db = None

    def connect(self):
        self.__client = MongoClient(
            self.__uri,
            server_api=ServerApi(version="1", strict=True, deprecation_errors=True)
        )
        self.__db = self.__client["qurioquestions"]
        print("Connected to MongoDB!")

    def get_collection(self, name: str):
        return self.__db[name]

    def disconnect(self):
        if self.__client:
            self.__client.close()