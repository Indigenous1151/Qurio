import uuid

class Payment:
    def __init__(self, user_id: str, amount: float, currency: int, payment_type: str):
        self.payment_id = str(uuid.uuid4())
        self.user_id = user_id
        self.amount = amount
        self.payment_code = str(uuid.uuid4())[:8].upper()
        self.currency = currency
        self.payment_type = payment_type
        self.status = "COMPLETED"

    def get_payment_id(self) -> str:
        return self.payment_id

    def get_amount(self) -> float:
        return self.amount

    def get_status(self) -> str:
        return self.status

    def to_dict(self) -> dict:
        return self.__dict__