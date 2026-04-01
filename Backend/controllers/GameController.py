from flask import Blueprint, request, jsonify, current_app
from utils.HttpStatus import HttpStatus
from models.Statistics import Statistics

game_bp = Blueprint('game', __name__, url_prefix='/game')

class GameController:
    def __init__(self, game_service):
        self.service = game_service
        self.__register_routes()

    def __register_routes(self):
        game_bp.add_url_rule('/classic', 'start_classic', self.start_classic_game, methods=['POST'])
        game_bp.add_url_rule('/daily', 'start_daily', self.start_daily_game, methods=['POST'])
        game_bp.add_url_rule('/answer', 'submit_answer', self.submit_answer, methods=['POST'])
        game_bp.add_url_rule('/skip', 'skip_question', self.skip_question, methods=['POST'])
        game_bp.add_url_rule('/end', 'end_game', self.end_game, methods=['POST'])
        game_bp.add_url_rule('/result', 'save_result', self.save_result, methods=['POST'])

    def start_classic_game(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            game = self.service.create_classic_game(user_id)
            return jsonify({
                "game_id": game.game_id,
                "total_questions": len(game.questions),
                "is_daily": game.is_daily
            }), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def start_daily_game(self):
        try:
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            game = self.service.create_daily_game(user_id)
            return jsonify({
                "game_id": game.game_id,
                "total_questions": len(game.questions),
                "is_daily": game.is_daily
            }), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def submit_answer(self):
        try:
            data = request.get_json()
            correct = self.service.submit_answer(data['game_id'], data['answer'])
            return jsonify({"correct": correct}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def skip_question(self):
        try:
            data = request.get_json()
            self.service.skip_question(data['game_id'])
            return jsonify({"message": "Question skipped"}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def end_game(self):
        try:
            data = request.get_json()
            result = self.service.end_game(data['game_id'])
            return jsonify({
                "score": result.score,
                "total_questions": result.total_questions,
                "date_played": result.date_played,
                "is_daily": result.is_daily
            }), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    
    def save_result(self):
        print("save_result called!")
        try:
            print("save_result called!2")
            user_id = request.headers.get('X-User-Id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            data = request.get_json()
            self.service.save_result(
                user_id=user_id,
                score=data['score'],
                total=data['total'],
                skipped=data['skipped'],
                hints_used=data.get('hints_used', 0),
                category=data.get('category', ''),
                difficulty=data.get('difficulty', 'any'),
                is_daily=data.get('is_daily', False)
            )

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

            class TempGame:
                def __init__(self, score, total_questions, is_daily):
                    self.score = score
                    self.total_questions = total_questions
                    self.is_daily = is_daily

            game = TempGame(
                score=data['score'],
                total_questions=data['total'],
                is_daily=data.get('is_daily', False)
            )

            statistics.update_stats(game)

            client.table("statistics").update({
                "games_played": statistics.games_played,
                "questions_answered": statistics.questions_answered,
                "correct_answers": statistics.correct_answers,
                "accuracy": statistics.accuracy,
                "average_score": statistics.average_score,
                "rank": statistics.rank,
                "daily_games_played": statistics.daily_games_played,
                "classic_games_played": statistics.classic_games_played
            }).eq("user_id", user_id).execute()


            return jsonify({"message": "Result saved"}), HttpStatus.OK
        
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")
            raise e  