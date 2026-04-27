import sys
import os
import pytest
from flask import Flask
from unittest.mock import MagicMock
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from controllers.GameController import GameController


@pytest.fixture
def app():
    return Flask(__name__)

@pytest.fixture
def mock_service():
    return MagicMock()

@pytest.fixture
def mock_get_user_id():
    return MagicMock(return_value="test_user")

@pytest.fixture
def controller(mock_service, mock_get_user_id):
    return GameController(game_service=mock_service, get_user_id_func=mock_get_user_id)

#testing get hint feature
def test_get_hint_pass_sufficient_currency(app, controller, mock_service):
   
    mock_question = MagicMock()
    mock_question.to_dict.return_value = {
        "question": "What is 2+2?",
        "options": ["4", "2"] }
    mock_service.buy_hint.return_value = mock_question

    with app.test_request_context(json={"game_id": "game_1"}):
        response, status = controller.get_hint()

    assert status == 200
    body = response.get_json()
    assert "options" in body
    assert len(body["options"]) == 2
    mock_service.buy_hint.assert_called_once_with("test_user", "game_1")


def test_get_hint_fail_insufficient_currency(app, controller, mock_service):

    mock_service.buy_hint.side_effect = Exception("Insufficient currency")

    with app.test_request_context(json={"game_id": "game_1"}):
        response, status = controller.get_hint()

    assert status == 400
    assert "Insufficient currency" in response.get_json()["error"]


#testing the skip question feature
def test_skip_question_pass_sufficient_currency(app, controller, mock_service):

    mock_game = MagicMock()
    mock_game.skipped = 1
    mock_service.get_game.return_value = mock_game

    with app.test_request_context(json={"game_id": "game_1"}):
        response, status = controller.skip_question()

    assert status == 200
    body = response.get_json()
    assert body["skipped"] == 1
    assert body["message"] == "Question skipped successfully"
    mock_service.buy_skip.assert_called_once_with("test_user", "game_1")


def test_skip_question_fail_insufficient_currency(app, controller, mock_service):
  
    mock_service.buy_skip.side_effect = Exception("Insufficient currency")

    with app.test_request_context(json={"game_id": "game_1"}):
        response, status = controller.skip_question()

    assert status == 400
    assert "Insufficient currency" in response.get_json()["error"]