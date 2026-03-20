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

# for the hints
    # def use_hint(self, game_id):
    #     game = self.active_games.get(game_id)
    #     hint = MultipleChoiceHint()
    #     game.get_hint(hint)

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