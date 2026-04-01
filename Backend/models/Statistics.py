class Statistics:
    def __init__(
        self,
        username,
        games_played=0,
        questions_answered=0,
        correct_answers=0,
        accuracy=0.0,
        average_score=0.0,
        rank=0,
        daily_games_played=0,
        classic_games_played=0
    ):
        self.username = username
        self.games_played = games_played
        self.questions_answered = questions_answered
        self.correct_answers = correct_answers
        self.accuracy = accuracy
        self.average_score = average_score
        self.rank = rank
        self.daily_games_played = daily_games_played
        self.classic_games_played = classic_games_played

    def update_stats(self, game):
        old_games_played = self.games_played
        self.games_played += 1

        self.questions_answered += game.total_questions
        self.correct_answers += game.score

        if game.is_daily:
            self.daily_games_played += 1
        else:
            self.classic_games_played += 1

        if self.questions_answered > 0:
            self.accuracy = (self.correct_answers / self.questions_answered) * 100
        else:
            self.accuracy = 0.0

        self.average_score = (
            (self.average_score * old_games_played + game.score) / self.games_played
        )

    def to_dict(self):
        return {
            "username": self.username,
            "games_played": self.games_played,
            "daily_games_played": self.daily_games_played,
            "classic_games_played": self.classic_games_played,
            "questions_answered": self.questions_answered,
            "correct_answers": self.correct_answers,
            "accuracy": round(self.accuracy, 2),
            "average_score": round(self.average_score, 2),
            "rank": self.rank
        }