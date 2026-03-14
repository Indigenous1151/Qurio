from flask import Blueprint, request, jsonify
from services.UserService import UserService

user_bp = Blueprint('user', __name__, url_prefix='/user')


class UserController:
    def __init__(self, service: UserService):
        self.__service = service
        self.__register_routes()

    def __register_routes(self):
        # PUT routes
        user_bp.add_url_rule('/personal', 'update_personal', self.update_personal_information, methods=['PUT'])
        user_bp.add_url_rule('/profile', 'update_profile', self.update_public_profile, methods=['PUT'])
        # POST routes
        user_bp.add_url_rule('/register', 'register', self.create_account, methods=['POST'])
        user_bp.add_url_rule('/login', 'login', self.login, methods=['POST'])
        user_bp.add_url_rule('/signout', 'signout', self.signout, methods=['POST'])
        user_bp.add_url_rule('/forgot-password', 'forgot_password', self.forgot_password, methods=['POST'])

    def update_personal_information(self):
        data: dict = request.get_json()
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401

            updated = self.__service.update_personal_information(
                user_id=user_id,
                full_name=data['full_name'],
                email=data['email']
            )
            return jsonify({
                "message": "Personal information updated successfully",
                "user_id": updated.get_user_id(),
                "full_name": updated.get_full_name(),
                "email": updated.get_email()
            }), 200
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

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

    def create_account(self):
        data: dict = request.get_json()

        try:
            user = self.__service.create_account(
                username=data['username'],
                email=data['email'],
                password=data['password']
            )

            return jsonify({
                "message": "Account created successfully",
                "user_id": user.get_user_id(),
                "email": user.get_email(),
                "username": user.get_username()
            }), 201
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def login(self):
        pass

    def signout(self):
        pass

    def forgot_password(self):
        pass
