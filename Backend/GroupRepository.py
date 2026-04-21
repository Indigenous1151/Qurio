import uuid
from database.SupabaseClient import SupabaseClient
from models.Group import Group
from typing import Any, cast

class GroupRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def save_group(self, group: Group) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            client.table("groups").insert({
                "group_id": group.group_id,
                "group_name": group.group_name,
                "description": group.description,
                "owner_id": group.owner_id,
                "members": group.members,
                "invite_code": group.invite_code,
                "status": group.status
            }).execute()
            return True
        except Exception as e:
            print(f"Error saving group: {e}")
            return False

    def get_group(self, group_id: str) -> dict:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = client.table("groups").select("*").eq(
                "group_id", group_id
            ).execute()
            if result.data and len(result.data) > 0:
                return result.data[0] # type: ignore
            return {}
        except Exception as e:
            print(f"Error getting group: {e}")
            raise

    def get_user_groups(self, user_id: str) -> list[dict[str, Any]]:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = client.table("groups").select("*").contains(
                "members", [user_id]
            ).execute()
            return cast(list[dict[str, Any]], result.data)
        except Exception as e:
            print(f"Error getting user groups: {e}")
            raise

    def get_group_by_invite_code(self, invite_code: str) -> list[dict[str, Any]]:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("groups")
                      .select("*")
                      .eq("invite_code", invite_code)
                      .execute()
            )

            return cast(list[dict[str, Any]], result.data)
        except Exception as e:
            print(f"Error getting group invite: {e}")
            raise

    def get_group_invites(self, user_id: str) -> list[dict[str, Any]]:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("group_invites")
                .select("""
                    invite_id,
                    group_id,
                    status,
                    invited_by,
                    invited_by_user:public_profile ( username ),
                    groups ( group_name )
                """)
                .eq("invited_user", user_id)
                .eq("status", "PENDING")
                .execute()
            )

            print(f"DEBUG RESULT DATA: {result.data}")

            return cast(list[dict[str, Any]], result.data)
        except Exception as e:
            print(f"Error getting group invites: {e}")
            raise

    def add_user_to_group(self, group_id: str, user_id: str):
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            # Fetch existing members
            group_resp = (
                client.table("groups")
                .select("members")
                .eq("group_id", group_id)
                .single()
                .execute()
            )

            members: list[str] = group_resp.data.get("members", []) # type: ignore

            # Avoid duplicates
            if user_id in members:
                raise Exception("User is already a member of this group")
            members.append(user_id)

            # Update group row
            update_resp = (
                client.table("groups")
                .update({"members": members})
                .eq("group_id", group_id)
                .execute()
            )

            return cast( list[dict[str, Any]], update_resp.data)

        except Exception as e:
            print(f"Error adding user to group: {e}")
            raise

    def mark_invite_used(self, invite_code: str):
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            invite_resp = (
                client.table("group_invites")
                      .update({"status": "ACCEPTED"})
                      .eq("invite_id", invite_code)
                      .execute()
            )
            if not invite_resp.data:
                raise Exception("invite_resp is None")

            return invite_resp.data

        except Exception as e:
            print(f"Error updating invite status: {e}")
            raise

    def remove_user_from_group(self, group_id: str, user_id: str):
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            # Fetch existing members
            group_resp = (
                client.table("groups")
                .select("members")
                .eq("group_id", group_id)
                .single()
                .execute()
            )

            members: list[str] = group_resp.data.get("members", []) # type: ignore

            # Remove user if present
            if user_id in members:
                members.remove(user_id)

            # Update group row
            update_resp = (
                client.table("groups")
                .update({"members": members})
                .eq("group_id", group_id)
                .execute()
            )

            return update_resp.data

        except Exception as e:
            print(f"Error removing user from group: {e}")
            raise

    def save_invite(self, invite) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            client.table("group_invites").insert({
                "invite_id": invite.invite_id,
                "group_id": invite.group_id,
                "invited_by": invite.invited_by,
                "invited_user": invite.invited_user,
                "status": invite.status
            }).execute()
            return True
        except Exception as e:
            print(f"Error saving invite: {e}")
            return False

    def get_pending_invites(self, user_id: str) -> list:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = (
                client.table("group_invites")
                .select("""
                    invite_id,
                    group_id,
                    status,
                    invited_by,
                    invited_by_user:public_profile!group_invites_invited_by_fk ( username ),
                    groups!group_invites_group_id_fkey ( group_name )
                """)
                .eq("invited_user", user_id)
                .eq("status", "pending")
                .execute()
            )

            print(f"DEBUG RESULT DATA: {result.data}")

            return result.data
        except Exception as e:
            print(f"Error getting pending invites: {e}")
            raise

    def update_invite_status(self, invite_id: str, status: str) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            client.table("group_invites").update({
                "status": status
            }).eq("invite_id", invite_id).execute()
            return True
        except Exception as e:
            print(f"Error updating invite: {e}")
            return False

    def add_member(self, group_id: str, user_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            group = self.get_group(group_id)
            if not group:
                raise Exception("Group not found")
            members = group["members"]
            if user_id not in members:
                members.append(user_id)
            client.table("groups").update({
                "members": members
            }).eq("group_id", group_id).execute()
            return True
        except Exception as e:
            print(f"Error adding member: {e}")
            return False

    def create_game(self, game_data: dict[str, Any], question_data):
        # store game data in supabase group_games table
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            game_id = str(uuid.uuid4())
            group_games_row_data = {
                "game_id": game_id,
                "group_id": game_data.get("group_id"),
                "created_by": game_data.get("created_by"),
                "start_at": game_data.get("start_at"),
                "duration_hours": game_data.get("duration_hours"),
                "end_at": game_data.get("end_at"),
                "status": game_data.get("status", "invalid"), # alternative will prevent row insertion
                "game_params": game_data.get("game_params", {}),
                "questions": question_data,
            }

            result = client.table("group_games").insert(group_games_row_data).execute()
            return result

        except Exception as e:
            print(f"Error creating group game: {e}")
            raise

    def get_active_games(self, user_id: str, group_id: str):
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            return self.get_games_helper(client, user_id, group_id, status="active")

        except Exception as e:
            print(f"Error getting games: {e}")
            raise

    def get_upcoming_games(self, user_id: str, group_id: str):
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            return self.get_games_helper(client, user_id, group_id, status="upcoming")

        except Exception as e:
            print(f"Error getting games: {e}")
            raise

    def get_games_helper(self, client, user_id: str, group_id: str, status: str):
        # get list of members in group from database
        # NOTE: this list is a list of rows returned by supabase,
        # not a list of members directly
        result = (
            client.table("groups")
            .select("members")
            .eq("group_id", group_id)
            .single()
            .execute()
        )

        # should only be one row
        group_members = result.data.get("members", [])

        if not isinstance(group_members, list):
            raise Exception("Invalid members format")

        if user_id not in group_members:
            raise Exception("User is not part of the group")

        result = (
            client.table("group_games")
            .select("*")
            .eq("group_id", group_id)
            .eq("status", status)
            .execute()
        )
        
        if hasattr(result, "error") and result.error:
            raise Exception(result.error.message)
        
        return result.data or []