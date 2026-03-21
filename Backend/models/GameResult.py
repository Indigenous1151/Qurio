import datetime
import uuid

class GameResult:
    def __init__(self, user, score, total_questions, is_daily, hints_used,skipped):
        self.result_id = str(uuid.uuid4())
        self.user = user
        self.score = score
        self.total_questions = total_questions
        self.date_played = str(datetime.datetime.now())
        self.is_daily = is_daily
        self.hints_used = hints_used
        self.skipped = skipped

    def calculate_reward(self):
        return self.score * 10

    def to_dict(self):
        return self.__dict__