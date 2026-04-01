from flask import Blueprint, jsonify, request, current_app
from models.Statistics import Statistics

statistics_bp = Blueprint("statistics", __name__, url_prefix="/api/statistics")

@statistics_bp.route("/me", methods=["GET"])
def get_my_statistics():
    try:
        user_id = request.headers.get("X-User-Id")

        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

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

        statistics = Statistics(
            username=username,
            games_played=stats_data.get("games_played", 0),
            questions_answered=stats_data.get("questions_answered", 0),
            correct_answers=stats_data.get("correct_answers", 0),
            accuracy=stats_data.get("accuracy", 0.0),
            average_score=stats_data.get("average_score", 0.0),
            rank=stats_data.get("rank", 0),
            daily_games_played=stats_data.get("daily_games_played", 0),
            classic_games_played=stats_data.get("classic_games_played", 0)
        )

        return jsonify(statistics.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500