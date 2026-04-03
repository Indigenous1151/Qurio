from flask import Blueprint, request, jsonify
from services.GroupService import GroupService

group_bp = Blueprint('group', __name__, url_prefix='/group')

class GroupController:
    def __init__(self, service: GroupService):
        self.__service = service
        self.__register_routes()

    def __register_routes(self):
        group_bp.add_url_rule('/create', 'create_group', self.create_group, methods=['POST'])
        # group_bp.add_url_rule('/invite', 'invite_user', self.invite_user, methods=['POST'])
        group_bp.add_url_rule('/my-groups', 'get_user_groups', self.get_user_groups, methods=['GET'])  

    def create_group(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            group = self.__service.create_group(
                user_id,
                data['group_name'],
                data.get('description', '')
            )
            return jsonify({
                "message": "Group created successfully",
                "group_id": group.group_id,
                "group_name": group.group_name,
                "description": group.description,
                "invite_code": group.invite_code,
                "members": group.members
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    

    def get_user_groups(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            groups = self.__service.get_user_groups(user_id)
            return jsonify({"groups": groups}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    