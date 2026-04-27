from models.Game import Game
from models.Question import Question
from models.GameResult import GameResult
from GameRepository import GameRepository
from models.MultipleChoiceHint import MultipleChoiceHint
from UserRepository import UserRepository


class GameService:
    def __init__(self, question_repo, game_repo: GameRepository, trivia_service, user_repo: UserRepository):
        self.question_repo = question_repo
        self.game_repo = game_repo
        self.trivia_service = trivia_service
        self.active_games: dict[str, Game] = {}
        self.user_repo = user_repo

    def create_classic_game(self, user, count=10, category=None, difficulty=None):
        questions_data = self.trivia_service.fetch_questions(count, category, difficulty)
        questions = [Question(q) for q in questions_data]

        game = Game(user, questions, is_daily=False)
        self.active_games[game.game_id] = game

        # Save to database for persistence
        self.game_repo.save_active_game(game)
        return game

    def create_daily_game(self, user):
        # Check if user has an active daily game
        active_daily = None
        for game in self.active_games.values():
            if game.user == user and game.is_daily:
                active_daily = game
                break
        
        # If no active game in memory, check database
        if not active_daily:
            for game_doc in self.game_repo.active_games_collection.find({"user": user, "is_daily": True}):
                questions = [Question(q) for q in game_doc.get("questions", [])]
                game = Game(
                    game_doc["user"],
                    questions,
                    is_daily=True,
                    game_id=game_doc["game_id"]
                )
                game.current_index = game_doc.get("current_index", 0)
                game.score = game_doc.get("score", 0)
                game.questions_answered = game_doc.get("questions_answered", 0)
                game.hints_used = game_doc.get("hints_used", 0)
                game.skipped = game_doc.get("skipped", 0)
                self.active_games[game.game_id] = game
                active_daily = game
                break
        
        # If there's an active daily game, return it
        if active_daily:
            return active_daily
        
        # Check if user has already played a daily game today
        if self.game_repo.has_daily_game_today(user):
            raise Exception("Daily game already played today")
        
        # Create new daily game
        questions_data = self.trivia_service.fetch_questions(5)
        questions = [Question(q) for q in questions_data]

        game = Game(user, questions, is_daily=True)
        self.active_games[game.game_id] = game
        # Save to database for persistence
        self.game_repo.save_active_game(game)
        return game

    def submit_answer(self, game_id, answer):
        game = self._get_game_from_db_or_memory(game_id)
        if not game:
            return None
        result = game.submit_answer(answer)
        self.game_repo.save_active_game(game)
        return result

    def skip_question(self, game_id):
        game = self._get_game_from_db_or_memory(game_id)
        if not game:
            return
        game.skip_question()
        self.game_repo.save_active_game(game)

    def save_result(self, user_id, score, total, skipped, category, difficulty, is_daily,hints_used):
        result = GameResult(
            user=user_id,
            score=score,
            total_questions=total,
            is_daily=is_daily,
            hints_used=hints_used,
            skipped= skipped
        )
        self.game_repo.save(result)
        return result

    def get_hint(self, game_id) -> Question | None:
        game: Game | None = self._get_game_from_db_or_memory(game_id)
        if not game:
            return None

        hint = MultipleChoiceHint()
        game.get_hint(hint)
        self.game_repo.save_active_game(game)
        return game.questions[game.current_index]

    def get_current_question(self, game_id):
        game = self._get_game_from_db_or_memory(game_id)
        if not game or game.current_index >= len(game.questions):
            return None
        return game.questions[game.current_index]

    def get_game(self, game_id):
        return self._get_game_from_db_or_memory(game_id)

    def _get_game_from_db_or_memory(self, game_id):
        """Get game from memory first, then try database"""
        # Try memory first (faster)
        if game_id in self.active_games:
            return self.active_games[game_id]
        
        # If not in memory, load from database
        game = self.game_repo.load_active_game(game_id)
        if game:
            self.active_games[game_id] = game
        return game

    def get_active_game(self, user_id: str) -> Game | None:
        # Find the active game for this user
        for game in self.active_games.values():
            if game.user == user_id:
                return game
            
        # None in memory, so get active games from database for the user
        for game_doc in self.game_repo.active_games_collection.find({"user": user_id}):
            questions = [Question(q) for q in game_doc.get("questions", [])]
            game = Game(
                game_doc["user"],
                questions,
                is_daily=game_doc.get("is_daily", False),
                game_id=game_doc["game_id"]
            )
            game.current_index = game_doc.get("current_index", 0)
            game.score = game_doc.get("score", 0)
            game.questions_answered = game_doc.get("questions_answered", 0)
            game.hints_used = game_doc.get("hints_used", 0)
            game.skipped = game_doc.get("skipped", 0)

            # Load into memory for next call
            self.active_games[game.game_id] = game
            return game

        return None

    def end_game(self, game_id: str):
        game: Game | None = self._get_game_from_db_or_memory(game_id)

        if not game:
            return None

        result = GameResult(
            user=game.user,
            score=game.get_score(),
            total_questions=len(game.questions),
            is_daily=game.is_daily,
            hints_used=game.hints_used,
            skipped=game.skipped
        )
        self.game_repo.save(result)
        # Clean up from memory and database
        if game_id in self.active_games:
            del self.active_games[game_id]
        self.game_repo.delete_active_game(game_id)

        return result
    
    def buy_hint(self, user_id: str, game_id: str) -> Question | None:
        hint_cost = 25

        current_currency = self.user_repo.get_user_currency(user_id)
        if current_currency < hint_cost:
            raise Exception("Not enough currency for a hint")

        success = self.user_repo.deduct_currency(user_id, hint_cost)
        if not success:
            raise Exception("Failed to deduct currency for hint")

        updated_question = self.get_hint(game_id)
        if updated_question is None:
            raise Exception("Could not get hint")

        return updated_question


    def buy_skip(self, user_id: str, game_id: str) -> None:
        skip_cost = 50

        current_currency = self.user_repo.get_user_currency(user_id)
        if current_currency < skip_cost:
            raise Exception("Not enough currency to skip a question")

        success = self.user_repo.deduct_currency(user_id, skip_cost)
        if not success:
            raise Exception("Failed to deduct currency for skip")

        self.skip_question(game_id)