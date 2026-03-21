from models.GameResult import GameResult

class GameRepository:
    def __init__(self, db_client):
        self.collection = db_client.get_collection("game_results") # saves data to game_results connection
    def get_results(self, user_id):
        return list(self.collection.find({"user": user_id}))

    def save(self, result: GameResult) -> bool:
        #print("save_result called")
        try:
            print(f"Saving result: {result.to_dict()}")
            self.collection.insert_one(result.to_dict())
            print("Result saved successfully!")
            return True
        except Exception as e:
            print("Error:", e)
            return False

    