from flask import Blueprint, request, jsonify
from services.AuthService import AuthService
from utils.HttpStatus import HttpStatus

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

class AuthController:

    def __init__(self, service: AuthService, get_user_id_func):
        self.__service = service
        self.get_user_id = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        # POST routes
        auth_bp.add_url_rule('/register', 'register', self.create_account, methods=['POST'])
        auth_bp.add_url_rule('/login', 'login', self.login, methods=['POST'])
        auth_bp.add_url_rule('/signout', 'signout', self.sign_out, methods=['POST'])
        auth_bp.add_url_rule('/forgot-password', 'forgot_password', self.forgot_password, methods=['POST'])
        auth_bp.add_url_rule('/reset-password', 'reset_password', self.reset_password, methods=['POST'])

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
                "user_id": user.get_personal_info().get_user_id(),
                "email": user.get_personal_info().get_email(),
                "username": user.get_public_info().get_username()
            }), HttpStatus.CREATED
        except KeyError as e:
            return jsonify({"error": f"Missing field: {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            error_text = str(e)

            if "public_profile_username_key" in error_text or (
                "already exists" in error_text.lower() and "username" in error_text.lower()
            ):
                return jsonify({"error": "That username is already taken."}), HttpStatus.BAD_REQUEST

            return jsonify({"error": error_text}), HttpStatus.INTERNAL_SERVER_ERROR

    def login(self):
        data: dict = request.get_json()

        try:
            user = self.__service.login(
                email = data['email'],
                password = data['password']
            )

            return jsonify({
                "message": "Login Successful",
                "user_id": user.get_personal_info().get_user_id(),
                "username": user.get_public_info().get_username()
            }), HttpStatus.OK
        except KeyError as e:
            return jsonify({"error": f"Missing field {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def sign_out(self):
        try:
            user_id = self.get_user_id(request)

            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            self.__service.sign_out()

            return jsonify({"message": "Logged out successfully"}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def forgot_password(self):
        data: dict = request.get_json()

        try:
            self.__service.forgot_password(email=data['email'])

            return jsonify({
                "Message": "Password reset email sent"
            }), HttpStatus.OK
        except KeyError as e:
            return jsonify({"error": f"Missing field {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def reset_password(self):
        data = request.get_json()

        try:
            new_password = data["password"]

            self.__service.reset_password(new_password=new_password)

            return jsonify({"message": "Password reset successfully"}), HttpStatus.OK

        except KeyError as e:
            return jsonify({"error": f"Missing field {str(e)}"}), HttpStatus.BAD_REQUEST
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR