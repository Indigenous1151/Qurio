
class GameController:
    def __init__(self, game_service):
        self.service = game_service

    def play_game(self, user):
        return self.service.create_classic_game(user)   

    def get_hint(self, game_id):
        return self.service.use_hint(game_id)