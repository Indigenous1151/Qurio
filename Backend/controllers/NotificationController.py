from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from services.NotificationService import NotificationService
from utils.HttpStatus import HttpStatus


notification_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


class NotificationController:
    def __init__(self, service: NotificationService, get_user_id_func):
        self.__service: NotificationService = service
        self.get_user_id = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        notification_bp.add_url_rule(
            "/me",
            "get_notifications",
            self.get_notifications,
            methods=["GET", "OPTIONS"]
        )

        notification_bp.add_url_rule(
            "/<notification_id>",
            "delete_notification",
            self.delete_notification,
            methods=["DELETE", "OPTIONS"]
        )

    @cross_origin(
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_headers=["Authorization", "Content-Type"],
        methods=["GET", "OPTIONS"]
    )
    def get_notifications(self):
        try:
            user_id = self.get_user_id(request)

            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            notifications = self.__service.get_notifications(user_id)

            return jsonify(notifications), HttpStatus.OK

        except Exception as e:
            print("Error in get_notifications:", e)
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    @cross_origin(
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_headers=["Authorization", "Content-Type"],
        methods=["DELETE", "OPTIONS"]
    )
    def delete_notification(self, notification_id):
        try:
            user_id = self.get_user_id(request)

            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            success = self.__service.delete_notification(notification_id)

            if not success:
                return jsonify({"error": "Failed to delete notification"}), HttpStatus.BAD_REQUEST

            return jsonify({"message": "Notification deleted successfully"}), HttpStatus.OK

        except Exception as e:
            print("Error in delete_notification:", e)
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR