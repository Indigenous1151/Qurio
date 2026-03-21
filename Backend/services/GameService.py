from models.Game import Game
from models.Question import Question
from models.GameResult import GameResult

class GameService:
    def __init__(self, question_repo, game_repo, trivia_service):
        self.question_repo = question_repo
        self.game_repo = game_repo
        self.trivia_service = trivia_service
        self.active_games = {}

    def create_classic_game(self, user):
        questions_data = self.trivia_service.fetch_questions(10)
        questions = [Question(q) for q in questions_data]

        game = Game(user, questions, is_daily=False)
        self.active_games[game.game_id] = game
        return game
    
    def create_daily_game(self, user):
        questions_data = self.trivia_service.fetch_questions(5)
        questions = [Question(q) for q in questions_data]

        game = Game(user, questions, is_daily=False)
        self.active_games[game.game_id] = game
        return game

    def submit_answer(self, game_id, answer):
        game = self.active_games.get(game_id)
        return game.submit_answer(answer)
    
    def skip_question(self, game):
        game.skip_question(self)
    def save_result(self, user_id, score, total, skipped, category, difficulty, is_daily,hints_used):
        from models.GameResult import GameResult
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



    def end_game(self, game_id):
        game = self.active_games.get(game_id)

        result = GameResult(
            user=game.user,
            score=game.get_score(),
            total_questions=len(game.questions),
            is_daily=game.is_daily,
            hints_used=0
        )
        self.game_repo.save(result)
        del self.active_games[game_id]

        return result