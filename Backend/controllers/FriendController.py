from flask import Blueprint, request, jsonify
from services.FriendService import FriendService

friend_bp = Blueprint('friend', __name__, url_prefix='/friend')

class FriendController:
    def __init__(self, service: FriendService, get_user_id_func):
        self.__service = service
        self.__get_user_id_func = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        friend_bp.add_url_rule('/request', 'send_request', self.send_friend_request, methods=['POST'])
        friend_bp.add_url_rule('/accept-email', 'accept_email', self.accept_from_email, methods=['GET'])
        friend_bp.add_url_rule('/decline-email', 'decline_email', self.decline_from_email, methods=['GET'])
        friend_bp.add_url_rule('/search', 'search_user', self.search_user, methods=['GET'])
        friend_bp.add_url_rule('/list', 'get_friends', self.get_friends_list, methods=['GET'])
        friend_bp.add_url_rule('/remove', 'remove_friend', self.remove_friend, methods=['DELETE'])

    def accept_from_email(self):
        try:
            sender_id = request.args.get('sender_id')
            receiver_id = request.args.get('receiver_id')
            success = self.__service.accept_friend_request(sender_id, receiver_id)
            if success:
                # to be replaced with qurio frontend url after deployment
                return """
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2 style="color: #638F77;">Friend Request Accepted!</h2>
                            <p>You are now friends on Qurio.</p>
                            <a href="http://localhost:5173">Go to Qurio</a>
                        </body>
                    </html>
                """
            return "Something went wrong.", 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def decline_from_email(self):
        try:
            sender_id = request.args.get('sender_id')
            receiver_id = request.args.get('receiver_id')
            success = self.__service.decline_friend_request(sender_id, receiver_id)
            if success:
                # to be replaced with qurio frontend url after deployment
                return """
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h2 style="color: #e74c3c;">Friend Request Declined.</h2>
                            <p>The friend request has been declined.</p>
                            <a href="http://localhost:5173">Go to Qurio</a> 
                        </body>
                    </html>
                """
            return "Something went wrong.", 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    def send_friend_request(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.send_friend_request(user_id, data['receiver_id'])
            return jsonify({"message": "Friend request sent"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def accept_friend_request(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.accept_friend_request(data['sender_id'], user_id)
            return jsonify({"message": "Friend request accepted"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def decline_friend_request(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.decline_friend_request(data['sender_id'], user_id)
            return jsonify({"message": "Friend request declined"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def search_user(self):
        try:
            query = request.args.get('query', '')
            search_type = request.args.get('type', 'username')
            results = self.__service.search_user(query, search_type)
            return jsonify({"results": results}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    def get_friends_list(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            friends = self.__service.get_friends_list(user_id)
            return jsonify({"friends": friends}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    def remove_friend(self):
        try:
            user_id = self.__get_user_id_func(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.remove_friend(user_id, data['friend_id'])
            return jsonify({"message": "Friend removed"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500