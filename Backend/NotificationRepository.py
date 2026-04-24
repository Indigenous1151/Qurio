from models.Notification import Notification

class NotificationRepository:
    def __init__(self, db_client):
        self.__db_client = db_client

    def create_notification(self, notification: Notification) -> bool:
        try:
            client = self.__db_client.get_client()

            response = (
                client.table("notifications")
                .insert(notification.to_dict())
                .execute()
            )

            return response.data is not None

        except Exception as e:
            print("Error creating notification:", e)
            return False

    def get_notifications_by_user_id(self, user_id: str):
        try:
            client = self.__db_client.get_client()

            response = (
                client.table("notifications")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )

            return response.data

        except Exception as e:
            print("Error getting notifications:", e)
            return []

    def delete_notification(self, notification_id: str) -> bool:
        try:
            client = self.__db_client.get_client()

            response = (
                client.table("notifications")
                .delete()
                .eq("notification_id", notification_id)
                .execute()
            )

            return response.data is not None

        except Exception as e:
            print("Error deleting notification:", e)
            return False