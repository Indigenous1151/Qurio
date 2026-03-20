from models.Question import Question
from database.MongoDBClient import MongoDBClient

class QuestionRepository:
    def __init__(self, db_client: MongoDBClient):
        self.collection = db_client.get_collection("questions")

    def save(self, question: Question) -> bool:
        try:
            self.collection.insert_one(question.to_dict())
            return True
        except Exception as e:
            print("Error saving question:", e)
            return False
