from flask import Blueprint, request, jsonify
from services.GroupService import GroupService

group_bp = Blueprint('group', __name__, url_prefix='/group')

class GroupController:
    def __init__(self, service: GroupService):
        self.__service = service
        self.__register_routes()

    def __register_routes(self):
        group_bp.add_url_rule('/create', 'create_group', self.create_group, methods=['POST'])
        group_bp.add_url_rule('/my-groups', 'get_user_groups', self.get_user_groups, methods=['GET'])
        group_bp.add_url_rule('/invite', 'invite_user', self.invite_user, methods=['POST'])
        group_bp.add_url_rule('/pending-invites', 'pending_invites', self.get_pending_invites, methods=['GET'])
        group_bp.add_url_rule('/accept-invite', 'accept_invite', self.accept_invite, methods=['POST'])
        group_bp.add_url_rule('/decline-invite', 'decline_invite', self.decline_invite, methods=['POST'])
        group_bp.add_url_rule('/<group_id>', 'get_group', self.get_group, methods=['GET']) 

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
    def get_group(self, group_id):
        try:
            group = self.__service.get_group(group_id)
            return jsonify({"group": group}), 200
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

    def invite_user(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.invite_user(
                group_id=data['group_id'],
                invited_by=user_id,
                username=data['username']
            )
            return jsonify({"message": "Invite sent successfully"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def get_pending_invites(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            invites = self.__service.get_pending_invites(user_id)
            return jsonify({"pending_invites": invites}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def accept_invite(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            print(f"Accepting invite: {data}")
            success = self.__service.accept_invite(data['invite_id'], user_id)
            return jsonify({"message": "Invite accepted"}), 200 if success else 500
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")
            return jsonify({"error": str(e)}), 500  

    def decline_invite(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json()
            success = self.__service.decline_invite(data['invite_id'])
            return jsonify({"message": "Invite declined"}), 200 if success else 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500