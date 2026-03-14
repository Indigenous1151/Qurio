from flask import Blueprint, request, jsonify
from services.UserService import UserService
from utils.HttpStatus import HttpStatus

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
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

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
            }), HttpStatus.OK
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def update_public_profile(self):
        data: dict = request.get_json()
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            updated = self.__service.update_public_profile(
                user_id=user_id,
                username=data['username'],
                bio=data.get('bio', '')
            )
            return jsonify({
                "message": "Public profile updated successfully",
                "username": updated.get_username(),
                "bio": updated.get_bio()
            }), HttpStatus.OK
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

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
            }), HttpStatus.CREATED
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def login(self):
        data: dict = request.get_json()

        try:
            session = self.__service.login(
                email = data['email'],
                password = data['password']
            )

            return jsonify({
                "message": "Login Successful",
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "user_id": session.user.id # Supabase auth user object
            }), HttpStatus.OK
        except KeyError as e:
            return jsonify({"error": f"Missing field {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def signout(self):
        pass

    def forgot_password(self):
        pass
