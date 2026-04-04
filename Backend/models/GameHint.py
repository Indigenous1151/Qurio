from abc import ABC, abstractmethod
from models.Question import Question

class GameHint(ABC):

    @abstractmethod
    def apply_hint(self, question: Question) -> Question:
        """Method definition to be implemented by concrete GameHint objects"""
        pass