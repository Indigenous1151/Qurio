from flask import Blueprint, request, jsonify
from services.FriendService import FriendService
from utils.HttpStatus import HttpStatus

friend_bp = Blueprint('friend', __name__, url_prefix='/friend')

class FriendController:
    def __init__(self, service: FriendService, get_user_id_func, notification_service=None):
        self.__service = service
        self.__get_user_id_func = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        friend_bp.add_url_rule('/request', 'send_friend_request', self.send_friend_request, methods=['POST'])
        friend_bp.add_url_rule('/accept', 'accept_request', self.accept_friend_request, methods=['POST'])
        friend_bp.add_url_rule('/decline', 'decline_request', self.decline_friend_request, methods=['POST'])
        friend_bp.add_url_rule('/pending', 'pending_requests', self.get_pending_requests, methods=['GET'])
        friend_bp.add_url_rule('/list', 'get_friends', self.get_friends_list, methods=['GET'])
        friend_bp.add_url_rule('/remove', 'remove_friend', self.remove_friend, methods=['DELETE'])
        friend_bp.add_url_rule('/search', 'search_user', self.search_user, methods=['GET'])

    def send_friend_request(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            data = request.get_json()
            success = self.__service.send_friend_request(user_id, data['receiver_id'])

            if success and self.__notification_service:
                notification_created = self.__notification_service.create_notification(
                    data['receiver_id'],
                    "You received a new friend request."
                )
            if not notification_created:
                print("Friend request sent, but notification was not created.")

            return jsonify({"message": "Friend request sent"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def accept_friend_request(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            data = request.get_json()
            success = self.__service.accept_friend_request(data['sender_id'], user_id)
            return jsonify({"message": "Friend request accepted"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def decline_friend_request(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            data = request.get_json()
            success = self.__service.decline_friend_request(data['sender_id'], user_id)
            return jsonify({"message": "Friend request declined"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_pending_requests(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            pending = self.__service.get_pending_requests(user_id)
            return jsonify({"pending_requests": pending}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_friends_list(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            friends = self.__service.get_friends_list(user_id)
            return jsonify({"friends": friends}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def remove_friend(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            data = request.get_json()
            success = self.__service.remove_friend(user_id, data['friend_id'])
            return jsonify({"message": "Friend removed"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def search_user(self):
        try:
            query = request.args.get('query', '')
            search_type = request.args.get('type', 'username')
            results = self.__service.search_user(query, search_type)
            return jsonify({"results": results}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR
