from typing import Any, cast
from random import sample

class Question:
    def __init__(self, data: dict[str, Any]):
        self.type = data.get("type")
        self.difficulty = data.get("difficulty")
        self.category = data.get("category")
        self.question = data.get("question")
        self.correct_answer = data.get("correct_answer")
        self.incorrect_answers: list[str] = cast(list[str], data.get("incorrect_answers"))
        self.removed_answers = data.get("removed_answers", [])

    def to_dict(self):
        return {
            "type": self.type,
            "difficulty": self.difficulty,
            "category": self.category,
            "question": self.question,
            "correct_answer": self.correct_answer,
            "incorrect_answers": self.incorrect_answers,
            "removed_answers": self.removed_answers
        }

    def remove_incorrect_answer(self, count: int):
        """
        Updates the calling objects removed_answers to now have `count`
        removed answers randomly selected from the list of incorrect answers
        """
        self.removed_answers = sample(self.incorrect_answers, count)

    def __str__(self):
        return f"{self.question} ({self.difficulty})"