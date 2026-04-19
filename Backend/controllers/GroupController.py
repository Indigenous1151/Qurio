from flask import Blueprint, request, jsonify
from services.GroupService import GroupService
from utils.HttpStatus import HttpStatus

group_bp = Blueprint('group', __name__, url_prefix='/group')

class GroupController:
    def __init__(self, service: GroupService, get_user_id_func):
        self.__service = service
        self.get_user_id = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        group_bp.add_url_rule('/create', 'create_group', self.create_group, methods=['POST'])
        group_bp.add_url_rule('/my-groups', 'get_user_groups', self.get_user_groups, methods=['GET'])
        group_bp.add_url_rule('/join', 'join', self.join_group, methods=['POST'])
        group_bp.add_url_rule('/leave', 'leave', self.leave_group, methods=['POST'])
        group_bp.add_url_rule('/invite', 'invite_user', self.invite_user, methods=['POST'])
        group_bp.add_url_rule('/pending-invites', 'pending_invites', self.get_pending_invites, methods=['GET'])
        group_bp.add_url_rule('/accept-invite', 'accept_invite', self.accept_invite, methods=['POST'])
        group_bp.add_url_rule('/decline-invite', 'decline_invite', self.decline_invite, methods=['POST'])
        group_bp.add_url_rule('/<group_id>', 'get_group', self.get_group, methods=['GET'])
        group_bp.add_url_rule('/create-game', 'create_game', self.create_game, methods=['POST'])

    def create_group(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
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
            }), HttpStatus.CREATED
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_group(self, group_id):
        try:
            group = self.__service.get_group(group_id)
            return jsonify({"group": group}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_user_groups(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            groups = self.__service.get_user_groups(user_id)
            return jsonify({"groups": groups}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def join_group(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json() or {}
            invite_code = data.get("invite_code")
            if not invite_code:
                return jsonify({"error": "Could not parse invite_code from request"}), HttpStatus.BAD_REQUEST

            successful = self.__service.join_group(invite_code, user_id)
            return jsonify({"message": "Successfully joined group", "success": successful}), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def leave_group(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()

            group_id = data["group_id"]
            if not group_id:
                raise Exception("Could not parse group_id from request")

            successful = self.__service.leave_group(group_id, user_id)

            return jsonify({"message": "Successfully left group", "success": successful}), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def invite_user(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            success = self.__service.invite_user(
                group_id=data['group_id'],
                invited_by=user_id,
                username=data['username']
            )
            return jsonify({"message": "Invite sent successfully"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_pending_invites(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            invites = self.__service.get_pending_invites(user_id)
            return jsonify({"pending_invites": invites}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def accept_invite(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            print(f"Accepting invite: {data}")
            success = self.__service.accept_invite(data['invite_id'], user_id)
            return jsonify({"message": "Invite accepted"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def decline_invite(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            success = self.__service.decline_invite(data['invite_id'])
            return jsonify({"message": "Invite declined"}), HttpStatus.OK if success else HttpStatus.INTERNAL_SERVER_ERROR
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def create_game(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            
            # parse information from request
            group_id = data["group_id"]
            created_by = user_id # make it clear that the user is "created_by"
            start_at = int(data["start_at"])
            duration_hours = int(data["duration_hours"])
            duration_ms = duration_hours * 3_600_000
            end_at = start_at + duration_ms
            num_questions = data["question_count"]
            category = data.get("category", None)
            difficulty = data.get("difficulty", None)

            # store the parsed info in a dictionary
            game_data = {
                "group_id": group_id,
                "created_by": created_by,
                "start_at": start_at,
                "duration_hours": duration_hours,
                "end_at": end_at,
                "game_params": {
                    "amount": num_questions,
                    "type": "multiple", # just support multiple choice for now
                    "category": category,
                    "difficulty": difficulty
                }
            }

            response = self.__service.create_game(game_data)
            
            if not response or not response.data:
                raise Exception("Failed to create group game.")

            return jsonify({"message": "Group game created"}), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR