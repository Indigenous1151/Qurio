from PaymentRepository import PaymentRepository

class PaymentService:
    def __init__(self, repo: PaymentRepository):
        self.__repo = repo

    def __check_admin(self, user_id: str):
        if not self.__repo.is_admin(user_id):
            raise Exception("Unauthorized: Admin access required")

    def configure_payment_method(self, user_id: str, payment_type: str) -> bool:
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