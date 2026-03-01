from flask import Blueprint, request, jsonify
from services.UserService import UserService
from models.PersonalInformation import PersonalInformation
from models.User import User

user_bp = Blueprint('user', __name__, url_prefix='/user')


class UserController:
    def __init__(self, service: UserService):
        self.__service = service
        self.__register_routes()

    def __register_routes(self):
       
        user_bp.add_url_rule('/personal', 'update_personal', self.update_personal_information, methods=['PUT'])

    

    def update_personal_information(self):
        data: dict = request.get_json()
        try:
            user: User = data.get('user')
            personal_info = PersonalInformation(
                full_name=data['full_name'],
                email=data['email'],
                user_id=data['user_id']
            )
            updated_user = self.__service.update_personal_information(user, personal_info)
            return jsonify({"message": "Personal information updated", "user_id": updated_user.get_personal_info().get_user_id()}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400