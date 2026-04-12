from abc import ABC, abstractmethod

class PaymentType(ABC):
    @abstractmethod
    def validate(self) -> bool:
        pass

    @abstractmethod
    def process_payment(self, amount: float) -> bool:
        pass

class VisaCard(PaymentType):
    def __init__(self):
        self.type = "Visa"

    def validate(self) -> bool:
        return True

    def process_payment(self, amount: float) -> bool:
        return True

class MasterCard(PaymentType):
    def __init__(self):
        self.type = "MasterCard"

    def validate(self) -> bool:
        return True

    def process_payment(self, amount: float) -> bool:
        return True