from flask import Blueprint, request, jsonify, current_app
from utils.HttpStatus import HttpStatus
from models.Statistics import Statistics
from services.GameService import GameService
from models.Question import Question
from models.GameResult import GameResult

game_bp = Blueprint('game', __name__, url_prefix='/game')

class GameController:
    def __init__(self, game_service: GameService, get_user_id_func):
        self.service: GameService = game_service
        self.get_user_id = get_user_id_func
        self.__register_routes()

    def __register_routes(self):
        game_bp.add_url_rule('/classic', 'start_classic', self.start_classic_game, methods=['POST'])
        game_bp.add_url_rule('/daily', 'start_daily', self.start_daily_game, methods=['POST'])
        game_bp.add_url_rule('/continue', 'continue_game', self.continue_game, methods=['POST'])
        game_bp.add_url_rule('/current-question', 'get_current_question', self.get_current_question, methods=['POST'])
        game_bp.add_url_rule('/answer', 'submit_answer', self.submit_answer, methods=['POST'])
        game_bp.add_url_rule('/skip', 'skip_question', self.skip_question, methods=['POST'])
        game_bp.add_url_rule('/end', 'end_game', self.end_game, methods=['POST'])
        game_bp.add_url_rule('/result', 'save_result', self.save_result, methods=['POST'])
        game_bp.add_url_rule('/hint', 'get_hint', self.get_hint, methods=['POST'])
        game_bp.add_url_rule('/active', 'get_active_game', self.get_active_game, methods=['GET'])

    def start_classic_game(self):
        try:
            # print("Headers:", request.headers)
            user_id = self.get_user_id(request)
            print("User ID:", user_id)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            data = request.get_json() or {}
            print("Start game data:", data)

            # Try to resume existing game if game_id is provided.
            game_id = data.get('game_id')
            if game_id:
                game = self.service.get_game(game_id)
                if game:
                    print("Resuming existing game:", game_id)
                    return jsonify({
                        "game_id": game.game_id,
                        "current_index": game.current_index,
                        "score": game.score,
                        "skipped": game.skipped,
                        "hints_used": game.hints_used,
                        "question": game.questions[game.current_index].to_dict(),
                        "total_questions": len(game.questions),
                        "is_daily": game.is_daily
                    }), HttpStatus.OK

            game = self.service.create_classic_game(user_id, data.get('count', 10), data.get('category'), data.get('difficulty'))
            print("Game created:", game.game_id, len(game.questions))
            return jsonify({
                "game_id": game.game_id,
                "current_index": game.current_index,
                "score": game.score,
                "skipped": game.skipped,
                "hints_used": game.hints_used,
                "question": game.questions[game.current_index].to_dict(),
                "total_questions": len(game.questions),
                "is_daily": game.is_daily
            }), HttpStatus.OK
        except Exception as e:
            print("Error in start_classic_game:", e)
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_active_game(self):
        try:
            print("Checking for active game")
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            active_game = self.service.get_active_game(user_id)

            if not active_game:
                return jsonify({"active": False}), HttpStatus.OK

            return jsonify({
                "active": True,
                "game_id": active_game.game_id,
                "current_index": active_game.current_index,
                "score": active_game.score,
                "skipped": active_game.skipped,
                "hints_used": active_game.hints_used,
                "question": active_game.questions[active_game.current_index].to_dict()
                            if active_game.current_index < len(active_game.questions)
                            else None,
                "total_questions": len(active_game.questions),
                "is_daily": active_game.is_daily
            }), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def continue_game(self):
        try:
            print("Continue game called")
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json() or {}
            game_id = data.get('game_id')
            if not game_id:
                return jsonify({"error": "game_id required"}), HttpStatus.BAD_REQUEST

            print("Continue game for game_id:", game_id)
            game = self.service.get_game(game_id)
            if not game:
                print("Game not found for continue:", game_id)
                return jsonify({"error": "Game not found"}), HttpStatus.NOT_FOUND

            return jsonify({
                "game_id": game.game_id,
                "current_index": game.current_index,
                "score": game.score,
                "skipped": game.skipped,
                "hints_used": game.hints_used,
                "question": game.questions[game.current_index].to_dict() if game.current_index < len(game.questions) else None,
                "total_questions": len(game.questions),
                "is_daily": game.is_daily,
                "end": game.current_index >= len(game.questions)
            }), HttpStatus.OK

        except Exception as e:
            print("Error in continue_game:", e)
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def start_daily_game(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED
            game = self.service.create_daily_game(user_id)
            return jsonify({
                "game_id": game.game_id,
                "current_index": game.current_index,
                "score": game.score,
                "skipped": game.skipped,
                "hints_used": game.hints_used,
                "question": game.questions[game.current_index].to_dict(),
                "total_questions": len(game.questions),
                "is_daily": game.is_daily
            }), HttpStatus.OK
        except Exception as e:
            print(f"Error in start_daily_game: {str(e)}")
            import traceback
            traceback.print_exc()
            if str(e) == "Daily game already played today":
                return jsonify({"error": str(e)}), HttpStatus.COMPLETED
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
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            game_id = data['game_id']

            self.service.buy_skip(user_id, game_id)

            game = self.service.get_game(game_id)
            if game is None:
                return jsonify({"error": "Game not found"}), HttpStatus.NOT_FOUND

            return jsonify({
                "skipped": game.skipped,
                "message": "Question skipped successfully"
            }), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.BAD_REQUEST

    def end_game(self):
        try:
            data = request.get_json()
            result: GameResult | None = self.service.end_game(data['game_id'])

            if result is None:
                raise Exception("No results found")

            return jsonify({
                "score": result.score,
                "total_questions": result.total_questions,
                "skipped": result.skipped,
                "hints_used": result.hints_used,
                "date_played": result.date_played,
                "is_daily": result.is_daily
            }), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def get_hint(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            game_id = data['game_id']

            updated_question = self.service.buy_hint(user_id, game_id)

            if updated_question is None:
                raise Exception("updated_question returned None")

            return jsonify(updated_question.to_dict()), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.BAD_REQUEST

    def get_current_question(self):
        try:
            data = request.get_json()
            game_id = data['game_id']
            game = self.service.get_game(game_id)
            if game is None:
                return jsonify({"error": "Game not found"}), HttpStatus.NOT_FOUND
            if game.current_index >= len(game.questions):
                return jsonify({"end": True}), HttpStatus.OK
            question = game.questions[game.current_index]
            return jsonify({
                "current_index": game.current_index,
                "score": game.score,
                "skipped": game.skipped,
                "hints_used": game.hints_used,
                "question": question.to_dict(),
                "total_questions": len(game.questions),
                "is_daily": game.is_daily,
                "end": False
            }), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def save_result(self):
        print("save_result called!")
        try:
            print("save_result called!2")
            user_id = self.get_user_id(request)
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