import uuid
from datetime import datetime

class Notification:
    def __init__(self, user_id: str, notification: str):
        self.notification_id = str(uuid.uuid4())
        self.user_id = user_id
        self.notification = notification
        self.created_at = datetime.now().isoformat()

    def get_notification_id(self):
        return self.notification_id

    def get_user_id(self):
        return self.user_id

    def get_notification(self):
        return self.notification

    def get_created_at(self):
        return self.created_at

    def to_dict(self):
        return {
            "notification_id": self.notification_id,
            "user_id": self.user_id,
            "notification": self.notification,
            "created_at": self.created_at
        }
