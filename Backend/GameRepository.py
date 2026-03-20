from models.GameResult import GameResult

class GameRepository:
    def __init__(self, db_client):
        self.collection = db_client.get_collection("game_results")

    def save(self, result: GameResult) -> bool:
        try:
            self.collection.insert_one(result.to_dict())
            return True
        except Exception as e:
            print("Error saving result:", e)
            return False

    def get_results(self, user_id):
        return list(self.collection.find({"user": user_id}))