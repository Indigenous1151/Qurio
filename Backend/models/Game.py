import uuid
from models.Question import Question

class Game:
    def __init__(self, user, questions: list[Question], is_daily=False):       
        self.game_id = str(uuid.uuid4())
        self.user = user
        self.is_daily = is_daily
        self.question = questions
        self.question_answered = 0
        self.score = 0
        self.current_index = 0

    def get_score(self):
        return self.score
    
    def skip_question(self):
        self.current_index += 1

    def get_hint(self, hint):
        question = self.question[self.current_index]
        hint.apply_hint(question)

    def submit_answer(self, answer:str) -> bool:
        curr_question = self.question[self.current_index]

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