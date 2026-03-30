import uuid
from models.Question import Question
from models.GameHint import GameHint

class Game:
    def __init__(self, user, questions: list[Question], is_daily=False, game_id=None):
        self.game_id = str(uuid.uuid4()) if game_id is None else game_id
        self.user = user
        self.is_daily = is_daily
        self.questions = questions
        self.questions_answered = 0
        self.score = 0
        self.current_index = 0
        self.hints_used = 0
        self.skipped = 0

    def get_score(self):
        return self.score

    def skip_question(self):
        self.current_index += 1
        self.skipped += 1 # update the number of skips

    def get_hint(self, hint: GameHint):
        current_question = self.questions[self.current_index]
        current_question = hint.apply_hint(current_question)
        self.questions[self.current_index] = current_question
        self.hints_used += 1 # update the hints_used here

    def submit_answer(self, answer:str) -> bool:
        curr_question = self.questions[self.current_index]

        if answer == curr_question.correct_answer:
            self.score += 1
            correct = True
        else:
            correct = False

        self.questions_answered += 1
        self.current_index += 1

        return correct

    def is_complete(self):
        return self.current_index >= len(self.questions)