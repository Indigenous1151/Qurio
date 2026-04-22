from flask import Blueprint, request, jsonify
from services.PaymentService import PaymentService
from utils.HttpStatus import HttpStatus


payment_bp = Blueprint('payment', __name__, url_prefix='/payment')

class PaymentController:
    def __init__(self, service: PaymentService,get_user_id_func):
        self.__service: PaymentService = service
        self.__register_routes()
        self.get_user_id = get_user_id_func
        

    def __register_routes(self):
        payment_bp.add_url_rule('/admin/is-admin', 'is_admin', self.is_admin, methods=['GET'])
        payment_bp.add_url_rule('/admin/configure', 'configure', self.configure_payment_method, methods=['POST'])
        payment_bp.add_url_rule('/admin/configs', 'get_configs', self.get_payment_configs, methods=['GET'])
        payment_bp.add_url_rule('/admin/configs/<config_id>', 'delete_config', self.delete_payment_config, methods=['DELETE'])
        payment_bp.add_url_rule('/purchase', 'purchase_currency', self.purchase_currency, methods=['POST'])
        payment_bp.add_url_rule('/types', 'get_available_payment_types', self.get_available_payment_types, methods=['GET'])
        payment_bp.add_url_rule('/history', 'get_payment_history', self.get_payment_history, methods=['GET'])

    def is_admin(self):
        
        try:
            print("Headers:",request.headers)
            user_id = self.get_user_id(request)
            print(user_id)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            admin = self.__service.is_admin(user_id)
            return jsonify({"is_admin": admin}), HttpStatus.OK
        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR
            

    def configure_payment_method(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            self.__service.configure_payment_method(user_id, data['payment_type'])

            return jsonify({"message": "Payment method configured"}), HttpStatus.CREATED

        

        except Exception as e:
            if "already configured" in str(e):
                return jsonify({"error": str(e)}), HttpStatus.COMPLETED

            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR
    def get_payment_configs(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            configs = self.__service.get_payment_configs(user_id)
            return jsonify({"configs": configs}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def delete_payment_config(self, config_id):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            success = self.__service.delete_payment_config(user_id, config_id)
            return jsonify({"message": "Config deleted"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR
        
    def purchase_currency(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()

            payment = self.__service.purchase_currency(
                user_id=user_id,
                amount=data["amount"],
                currency_purchased=data["currency_purchased"],
                payment_type=data["payment_type"],
                card_number=data["card_number"],
                expiry=data["expiry"],
                cvv=data["cvv"]
            )

            return jsonify({
                "message": "Payment successful",
                "payment": payment.to_dict()
            }), HttpStatus.CREATED

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.BAD_REQUEST


    def get_available_payment_types(self):
        try:
            payment_types = self.__service.get_available_payment_configs()
            return jsonify({"payment_types": payment_types}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR


    def get_payment_history(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            history = self.__service.get_payment_history(user_id)
            return jsonify({"payments": history}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR