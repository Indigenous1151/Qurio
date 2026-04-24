from models.Notification import Notification

class NotificationService:
    def __init__(self, notification_repository):
        self.__notification_repository = notification_repository

    def create_notification(self, user_id: str, message: str) -> bool:
        notification = Notification(
            user_id=user_id,
            notification=message
        )

        return self.__notification_repository.create_notification(notification)

    def get_notifications(self, user_id: str):
        return self.__notification_repository.get_notifications_by_user_id(user_id)

    def delete_notification(self, notification_id: str) -> bool:
        return self.__notification_repository.delete_notification(notification_id)
    