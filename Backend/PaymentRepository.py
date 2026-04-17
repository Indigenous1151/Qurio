from database.SupabaseClient import SupabaseClient

class PaymentRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def is_admin(self, user_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            result = client.table("public_profile").select("is_admin").eq(
                "user_id", user_id
            ).single().execute()
            return result.data.get("is_admin", False)
        except Exception as e:
            print(f"Error checking admin: {e}")
            return False

    def save_payment_config(self, payment_type: str):
        client = self.__db_client.get_client()

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
            result = client.table("payment_config").select("*").execute()

            #print("DB RESULT:", result.data)   

            return result.data
        except Exception as e:
            print(f"Error getting payment configs: {e}")
            return []

    def delete_payment_config(self, config_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
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
            result = client.table("payment_config").select("*").eq(
                "is_active", True
            ).execute()
            return result.data
        except Exception as e:
            print(f"Error getting active configs: {e}")
            return []