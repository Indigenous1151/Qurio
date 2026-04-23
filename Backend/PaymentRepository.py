from database.SupabaseClient import SupabaseClient

class PaymentRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def is_admin(self, user_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("public_profile")
                      .select("is_admin")
                      .eq("user_id", user_id)
                      .single()
                      .execute()
            )

            return result.data.get("is_admin", False)
        except Exception as e:
            print(f"Error checking admin: {e}")
            return False

    def save_payment_config(self, payment_type: str):
        client = self.__db_client.get_client()
        if not client:
                raise Exception("Database client is None")

        result = client.table("payment_config") \
            .select("*") \
            .eq("payment_type", payment_type) \
            .execute()

        existing = result.data

        # if does not exist, insert
        if not existing:
            return client.table("payment_config").insert({
                "payment_type": payment_type,
                "is_active": True
            }).execute()

        row = existing[0]

        if not row["is_active"]:
            return client.table("payment_config") \
                .update({"is_active": True}) \
                .eq("payment_type", payment_type) \
                .execute()

        # if already active
        raise Exception("already configured")

    def get_payment_configs(self) -> list:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = client.table("payment_config").select("*").execute()

            #print("DB RESULT:", result.data)

            return result.data
        except Exception as e:
            print(f"Error getting payment configs: {e}")
            raise

    def delete_payment_config(self, config_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            client.table("payment_config").delete().eq(
                "config_id", config_id
            ).execute()
            return True
        except Exception as e:
            print(f"Error deleting payment config: {e}")
            return False

    def get_active_payment_configs(self) -> list:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = client.table("payment_config").select("*").eq(
                "is_active", True
            ).execute()
            return result.data
        except Exception as e:
            print(f"Error getting active configs: {e}")
            raise

    def is_payment_type_active(self, payment_type: str) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("payment_config")
                .select("*")
                .eq("payment_type", payment_type)
                .eq("is_active", True)
                .execute()
            )
            return len(result.data) > 0
        except Exception as e:
            print(f"Error checking payment type: {e}")
            return False

    def save_payment(self, payment) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            client.table("payment").insert(payment.to_dict()).execute()
            return True
        except Exception as e:
            print(f"Error saving payment: {e}")
            return False

    def get_payment_history(self, user_id: str) -> list:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("payment")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return result.data
        except Exception as e:
            print(f"Error getting payment history: {e}")
            raise

    def get_payment_logs(self) -> list:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("payment")
                .select("*")
                .order("created_at", desc=True)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"Error getting payment logs: {e}")
            raise

    def get_user_email(self, user_id: str) -> str:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            user_response = client.auth.admin.get_user_by_id(user_id)
            return user_response.user.email if user_response and user_response.user and user_response.user.email else ""
        except Exception as e:
            print(f"Error getting user email: {e}")
            raise

    def get_all_payment_logs_detailed(self) -> list:
        try:
            payments = self.get_payment_logs()
            detailed_logs = []

            for payment in payments:
                email = self.get_user_email(payment["user_id"])

                detailed_logs.append({
                    "payment_id": payment.get("payment_id"),
                    "created_at": payment.get("created_at"),
                    "user_id": payment.get("user_id"),
                    "email": email,
                    "amount": payment.get("amount"),
                    "currency_purchased": payment.get("currency_purchased"),
                    "payment_type": payment.get("payment_type"),
                    "status": payment.get("status"),
                    "payment_code": payment.get("payment_code"),
                })

            return detailed_logs
        except Exception as e:
            print(f"Error building detailed payment logs: {e}")
            raise
