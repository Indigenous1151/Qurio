
class Question:
    def _init_ (self, data:dict):
        self.type = data.get("type")
        self.difficulty = data.get("difficulty")
        self.category = data.get("category")
        self.question = data.get("question")
        self.correct_answer = data.get("correct_answer")
        self.incorrect_answers = data.get("incorrect_answers")

    def to_dict(self):
        return {
            "type": self.type,
            "difficulty": self.difficulty,
            "category": self.category,
            "question": self.question,
            "correct_answer": self.correct_answer,
            "incorrect_answers": self.incorrect_answers
        }

    def __str__(self):
        return f"{self.question} ({self.difficulty})"