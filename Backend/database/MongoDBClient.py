from pymongo import MongoClient

class MongoDBClient:
    def __init__(self, url:str, db_name: str):
        self.url = url
        self.db_name = db_name
        self.client = None
        self.db = None


    def connect(self):
        self.cleint = MongoClient(self.url)
        self.db = self.client(self.db_name)
    
    def disconnect(self):
        if self.client:
            self.client.close()

    def get_collection(self, name: str):
        return self.db[name]
