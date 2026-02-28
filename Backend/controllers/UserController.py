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
            user: User = data.get('user')
            public_info = PublicInformation(
                username=data['username'],
                bio=data['bio']
            )
            updated_user = self.__service.update_public_profile(user, public_info)
            return jsonify({"message": "Public profile updated", "username": updated_user.get_public_info().get_username()}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400