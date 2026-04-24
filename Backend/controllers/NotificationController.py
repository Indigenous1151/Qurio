from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin

notification_bp = Blueprint("notifications", __name__, url_prefix="/notifications")

@notification_bp.route("/me", methods=["GET", "OPTIONS"])
@cross_origin(
    origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_headers=["X-User-Id", "Content-Type"],
    methods=["GET", "OPTIONS"]
)
def get_notifications():
    try:
        user_id = request.headers.get("X-User-Id")

        if not user_id:
            return jsonify({"error": "Missing user ID"}), 401

        notification_service = current_app.config["NOTIFICATION_SERVICE"]

        notifications = notification_service.get_notifications(user_id)

        return jsonify(notifications), 200

    except Exception as e:
        print("Error in get_notifications:", e)
        return jsonify({"error": str(e)}), 500


@notification_bp.route("/<notification_id>", methods=["DELETE", "OPTIONS"])
@cross_origin(
    origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_headers=["Content-Type"],
    methods=["DELETE", "OPTIONS"]
)
def delete_notification(notification_id):
    try:
        notification_service = current_app.config["NOTIFICATION_SERVICE"]

        success = notification_service.delete_notification(notification_id)

        if not success:
            return jsonify({"error": "Failed to delete notification"}), 400

        return jsonify({"message": "Notification deleted successfully"}), 200

    except Exception as e:
        print("Error in delete_notification:", e)
        return jsonify({"error": str(e)}), 500
    