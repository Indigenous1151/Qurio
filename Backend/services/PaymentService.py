from PaymentRepository import PaymentRepository
from UserRepository import UserRepository
from models.Payment import Payment
from datetime import datetime
import re

class PaymentService:
    def __init__(self, repo: PaymentRepository, user_repo: UserRepository):
        self.__repo = repo
        self.__user_repo = user_repo

    def __check_admin(self, user_id: str):
        if not self.__repo.is_admin(user_id):
            raise Exception("Unauthorized: Admin access required")

    def configure_payment_method(self, user_id: str, payment_type: str):
        self.__check_admin(user_id)
        return self.__repo.save_payment_config(payment_type)

    def get_payment_configs(self, user_id: str) -> list:
        self.__check_admin(user_id)
        return self.__repo.get_payment_configs()

    def delete_payment_config(self, user_id: str, config_id: str) -> bool:
        self.__check_admin(user_id)
        return self.__repo.delete_payment_config(config_id)
    
    def is_admin(self, user_id: str) -> bool:
        return self.__repo.is_admin(user_id)
    def get_available_payment_configs(self) -> list:
        return self.__repo.get_active_payment_configs()
    
    def validate_card_details(self, payment_type: str, card_number: str, expiry: str, cvv: str) -> None:
        clean_card = card_number.replace(" ", "")

        if payment_type not in ["Visa", "MasterCard"]:
            raise Exception("Unsupported payment type")

        if not clean_card.isdigit():
            raise Exception("Card number must contain only digits")

        if len(clean_card) != 16:
            raise Exception("Card number must be 16 digits")

        if not cvv.isdigit() or len(cvv) != 3:
            raise Exception("CVV must be 3 digits")

        if not re.match(r"^(0[1-9]|1[0-2])\/\d{2}$", expiry):
            raise Exception("Expiry must be in MM/YY format")

        month_str, year_str = expiry.split("/")
        month = int(month_str)
        year = int("20" + year_str)

        now = datetime.now()
        current_year = now.year
        current_month = now.month

        if year < current_year or (year == current_year and month < current_month):
            raise Exception("Card is expired")
        
    def purchase_currency(
        self,
        user_id: str,
        amount: float,
        currency: int,
        payment_type: str,
        card_number: str,
        expiry: str,
        cvv: str
    ):
        if amount <= 0:
            raise Exception("Amount must be greater than 0")

        if currency <= 0:
            raise Exception("Currency amount must be greater than 0")

        if not self.__repo.is_payment_type_active(payment_type):
            raise Exception("Selected payment type is not active")

        self.validate_card_details(payment_type, card_number, expiry, cvv)

        payment = Payment(
            user_id=user_id,
            amount=amount,
            currency_purchased=currency,
            payment_type=payment_type
        )

        if not self.__repo.save_payment(payment):
            raise Exception("Failed to save payment")

        if not self.__user_repo.add_currency(user_id, currency):
            raise Exception("Failed to update user currency")

        return payment


    def get_payment_history(self, user_id: str) -> list:
        return self.__repo.get_payment_history(user_id)