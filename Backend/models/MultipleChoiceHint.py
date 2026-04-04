from models.GameHint import GameHint
from models.Question import Question

class MultipleChoiceHint(GameHint):

    def apply_hint(self, question: Question):
        question.remove_incorrect_answer(2)
        return question