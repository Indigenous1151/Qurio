from flask import Blueprint, request, jsonify
from utils.HttpStatus import HttpStatus

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
            return jsonify({"message": "Result saved"}), HttpStatus.OK
        except Exception as e:
            print(f"Error: {type(e).__name__}: {e}")
            raise e  