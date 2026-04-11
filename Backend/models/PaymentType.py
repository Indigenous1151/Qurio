from abc import ABC, abstractmethod

class PaymentType(ABC):
    @abstractmethod
    def validate(self) -> bool:
        pass

    @abstractmethod
    def process_payment(self, amount: float) -> bool:
        pass

class VisaCard(PaymentType):
    def __init__(self, card_number: str):
        self.card_number = card_number
        self.type = "Visa"

    def validate(self) -> bool:
        return len(self.card_number) == 16

    def process_payment(self, amount: float) -> bool:
        print(f"Processing Visa payment of ${amount}")
        return True

class MasterCard(PaymentType):
    def __init__(self, card_number: str):
        self.card_number = card_number
        self.type = "MasterCard"

    def validate(self) -> bool:
        return len(self.card_number) == 16

    def process_payment(self, amount: float) -> bool:
        print(f"Processing MasterCard payment of ${amount}")
        return True