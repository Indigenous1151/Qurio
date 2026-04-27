from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin
from models.Statistics import Statistics
from utils.HttpStatus import HttpStatus

print("StatisticsController loaded")

statistics_bp = Blueprint("statistics", __name__, url_prefix="/api/statistics")

class StatisticsController:
    def __init__(self, get_user_id_func):
        self.__get_user_id_func = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        statistics_bp.add_url_rule("/me", "get_my_statistics", self.get_my_statistics, methods=["GET", "OPTIONS"])

    def get_my_statistics(self):
        try:
            user_id = self.__get_user_id_func(request)

            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            client = current_app.config["SUPABASE"].get_client()

            stats_response = (
                client.table("statistics")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )

            stats_rows = stats_response.data

            if not stats_rows:
                client.table("statistics").insert({
                    "user_id": user_id,
                    "games_played": 0,
                    "questions_answered": 0,
                    "correct_answers": 0,
                    "accuracy": 0.0,
                    "average_score": 0.0,
                    "rank": 0,
                    "daily_games_played": 0,
                    "classic_games_played": 0
                }).execute()

                stats_response = (
                    client.table("statistics")
                    .select("*")
                    .eq("user_id", user_id)
                    .execute()
                )
                stats_rows = stats_response.data

            stats_data = stats_rows[0]

            profile_response = (
                client.table("public_profile")
                .select("username")
                .eq("user_id", user_id)
                .execute()
            )

            profile_rows = profile_response.data
            username = profile_rows[0]["username"] if profile_rows else "Unknown User"

            rank = self.calculate_user_rank(client, user_id)

            client.table("statistics").update({
                "rank": rank
            }).eq("user_id", user_id).execute()

            statistics = Statistics(
                username=username,
                games_played=stats_data.get("games_played", 0),
                questions_answered=stats_data.get("questions_answered", 0),
                correct_answers=stats_data.get("correct_answers", 0),
                accuracy=stats_data.get("accuracy", 0.0),
                average_score=stats_data.get("average_score", 0.0),
                rank=rank,
                daily_games_played=stats_data.get("daily_games_played", 0),
                classic_games_played=stats_data.get("classic_games_played", 0)
            )

            return jsonify(statistics.to_dict()), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR
        
    def calculate_user_rank(self, client, user_id):
        stats_response = (
            client.table("statistics")
            .select("user_id, correct_answers, accuracy, games_played")
            .execute()
        )

        stats_rows = stats_response.data

        if not stats_rows:
            return 0

        # Sort users by:
        # 1. correct_answers, highest first
        # 2. accuracy, highest first
        # 3. games_played, highest first
        sorted_stats = sorted(
            stats_rows,
            key=lambda row: (
                row.get("correct_answers", 0),
                row.get("accuracy", 0.0),
                row.get("games_played", 0)
            ),
            reverse=True
        )

        for index, row in enumerate(sorted_stats):
            if row.get("user_id") == user_id:
                return index + 1

        return 0