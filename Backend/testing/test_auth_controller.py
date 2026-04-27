import sys
import os
import pytest
from flask import Flask
from unittest.mock import MagicMock
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from controllers.AuthController import AuthController

@pytest.fixture
def app():
    return Flask(__name__)

@pytest.fixture
def mock_service():
    return MagicMock()

@pytest.fixture
def mock_get_user_id():
    return MagicMock(return_value=1)

@pytest.fixture
def controller(mock_service, mock_get_user_id):
    return AuthController(service=mock_service, get_user_id_func=mock_get_user_id)

# testing forgot password
def test_forgot_password_success(app, controller, mock_service):
    with app.test_request_context(json={"email": "test@example.com"}):
        response, status = controller.forgot_password()
        assert status == 200
        assert response.get_json() == {
            "Message": "Password reset email sent"
        }
        mock_service.forgot_password.assert_called_once_with(
            email="test@example.com"
        )

def test_forgot_password_missing_email(app, controller):
    with app.test_request_context(json={}):
        response, status = controller.forgot_password()
        assert status == 400
        assert "Missing field" in response.get_json()["error"]

def test_forgot_password_internal_error(app, controller, mock_service):
    mock_service.forgot_password.side_effect = Exception("Something broke")
    with app.test_request_context(json={"email": "test@example.com"}):
        response, status = controller.forgot_password()

        assert status == 500
        assert response.get_json()["error"] == "Something broke"

# testing reset password 
def test_reset_password_success(app, controller, mock_service):
    with app.test_request_context(json={"password":"newpassword123"}):
        response, status = controller.reset_password()
        assert status == 200
        assert response.get_json() == {
            "message" : "Password reset successfully"
        }
        mock_service.reset_password_assert_called_once_with(
            new_password="newpassword123"
        )

def test_reset_password_missing_password(app, controller):
    with app.test_request_context(json={}):
        response, status = controller.reset_password()
        assert status == 400
        assert "Missing field" in response.get_json()["error"]

def test_reset_password_interal_error(app, controller, mock_service):
    mock_service.reset_password.side_effect = Exception("Something broke")
    with app.test_request_context(json = {"password":"newpassword123"}):
        response, status = controller.reset_password()
        assert status == 500
        assert response.get_json()["error"] == "Something broke"