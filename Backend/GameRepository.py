from models.GameResult import GameResult
from models.Game import Game

class GameRepository:
    def __init__(self, db_client):
        self.results_collection = db_client.get_collection("game_results") # saves data to game_results connection
        self.active_games_collection = db_client.get_collection("active_games") # saves active game state
        # Make sure game_id is a unique index
        self.active_games_collection.create_index("game_id", unique=True)
    
    def get_results(self, user_id):
        return list(self.results_collection.find({"user": user_id}))

    def save(self, result: GameResult) -> bool:
        #print("save_result called")
        try:
            print(f"Saving result: {result.to_dict()}")
            self.results_collection.insert_one(result.to_dict())
            print("Result saved successfully!")
            return True
        except Exception as e:
            print("Error:", e)
            return False

    def save_active_game(self, game: Game) -> bool:
        """Save active game state to database"""
        try:
            game_data = {
                "game_id": game.game_id,
                "user": game.user,
                "is_daily": game.is_daily,
                "current_index": game.current_index,
                "score": game.score,
                "questions_answered": game.questions_answered,
                "hints_used": game.hints_used,
                "skipped": game.skipped,
                "questions": [q.to_dict() for q in game.questions]
            }
            result = self.active_games_collection.replace_one(
                {"game_id": game.game_id},
                game_data,
                upsert=True
            )
            print(f"Active game {game.game_id} saved to database, modified: {result.modified_count}, upserted: {result.upserted_id}")
            return True
        except Exception as e:
            print(f"Error saving active game: {e}")
            return False

    def load_active_game(self, game_id: str) -> Game | None:
        """Load active game state from database"""
        try:
            game_data = self.active_games_collection.find_one({"game_id": game_id})
            if not game_data:
                print(f"No game data found for game_id: {game_id}")
                return None

            # Reconstruct the Game object from stored data
            from models.Question import Question
            questions = [Question(q) for q in game_data.get("questions", [])]

            game = Game(game_data["user"], questions, is_daily=game_data.get("is_daily", False), game_id=game_data["game_id"])
            game.current_index = game_data.get("current_index", 0)
            game.score = game_data.get("score", 0)
            game.questions_answered = game_data.get("questions_answered", 0)
            game.hints_used = game_data.get("hints_used", 0)
            game.skipped = game_data.get("skipped", 0)

            print(f"Active game {game_id} loaded from database")
            return game
        except Exception as e:
            print(f"Error loading active game {game_id}: {e}")
            return None

    def delete_active_game(self, game_id: str) -> bool:
        """Delete active game from database"""
        try:
            self.active_games_collection.delete_one({"game_id": game_id})
            print(f"Active game {game_id} deleted from database")
            return True
        except Exception as e:
            print(f"Error deleting active game: {e}")
            return False