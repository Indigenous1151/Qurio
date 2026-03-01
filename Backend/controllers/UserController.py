from flask import Blueprint, request, jsonify
from services.UserService import UserService
from models.PublicInformation import PublicInformation
from models.User import User

user_bp = Blueprint('user', __name__, url_prefix='/user')


class UserController:
    def __init__(self, service: UserService):
        self.__service = service
        self.__register_routes()

    def __register_routes(self):
       
        user_bp.add_url_rule('/profile', 'update_profile', self.update_public_profile, methods=['PUT'])

    

    def update_public_profile(self):
        data: dict = request.get_json()
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401

            updated = self.__service.update_public_profile(
                user_id=user_id,
                username=data['username'],
                bio=data.get('bio', '')
            )
            return jsonify({
                "message": "Public profile updated successfully",
                "username": updated.get_username(),
                "bio": updated.get_bio()
            }), 200
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500