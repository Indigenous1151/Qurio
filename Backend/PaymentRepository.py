import os
from supabase import create_client
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

            print(f"Admin check for user_id={user_id}, result={result.data}, error={getattr(result, 'error', None)}")
            if not result.data:
                return False
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
            service_key = os.getenv("SUPABASE_SECRET_KEY")
            if not service_key:
                raise Exception("Supabase service key is not configured")

            admin_client = create_client(os.getenv("SUPABASE_URL", ""), service_key)
            user_response = admin_client.auth.admin.get_user_by_id(user_id)
            return user_response.user.email if user_response and user_response.user and user_response.user.email else ""
        except Exception as e:
            print(f"Error getting user email: {e}")
            return ""

    def get_all_payment_logs_detailed(self) -> list:
        try:
            payments = self.get_payment_logs()
            
            # Get unique user IDs
            unique_user_ids = list(set(p.get("user_id") for p in payments if p.get("user_id")))
            
            # Fetch all emails in bulk with retry logic
            service_key = os.getenv("SUPABASE_SECRET_KEY")
            if not service_key:
                raise Exception("Supabase service key is not configured")
            
            admin_client = create_client(os.getenv("SUPABASE_URL", ""), service_key)
            
            # Build email lookup map with retry logic
            email_map = {}
            max_retries = 3
            
            for user_id in unique_user_ids:
                for attempt in range(max_retries):
                    try:
                        user_response = admin_client.auth.admin.get_user_by_id(user_id)
                        email_map[user_id] = user_response.user.email if user_response and user_response.user else ""
                        break  # Success, exit retry loop
                    except Exception as e:
                        print(f"Attempt {attempt + 1}/{max_retries} - Error getting email for user {user_id}: {e}")
                        if attempt == max_retries - 1:
                            # Final attempt failed, set empty email
                            email_map[user_id] = ""
                        else:
                            import time
                            time.sleep(2 ** attempt)  # Exponential backoff
            
            # Build detailed logs using the map
            detailed_logs = []
            for payment in payments:
                user_id = payment.get("user_id")
                detailed_logs.append({
                    "payment_id": payment.get("payment_id"),
                    "created_at": payment.get("created_at"),
                    "user_id": user_id,
                    "email": email_map.get(user_id, ""),
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
