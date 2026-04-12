from flask import Blueprint, request, jsonify
from services.PaymentService import PaymentService

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')

class PaymentController:
    def __init__(self, service: PaymentService):
        self.__service = service
        self.__register_routes()

    def __register_routes(self):
        payment_bp.add_url_rule('/admin/is-admin', 'is_admin', self.is_admin, methods=['GET'])
        payment_bp.add_url_rule('/admin/configure', 'configure', self.configure_payment_method, methods=['POST'])
        payment_bp.add_url_rule('/admin/configs', 'get_configs', self.get_payment_configs, methods=['GET'])
        payment_bp.add_url_rule('/admin/configs/<config_id>', 'delete_config', self.delete_payment_config, methods=['DELETE'])

    def is_admin(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            admin = self.__service.is_admin(user_id)
            return jsonify({"is_admin": admin}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def configure_payment_method(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.configure_payment_method(user_id, data['payment_type'])
            return jsonify({"message": "Payment method configured"}), 201 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_payment_configs(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            configs = self.__service.get_payment_configs(user_id)
            return jsonify({"configs": configs}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_payment_config(self, config_id):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            success = self.__service.delete_payment_config(user_id, config_id)
            return jsonify({"message": "Config deleted"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500