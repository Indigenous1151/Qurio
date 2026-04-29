import os
import sys
import pytest
from flask import Flask
from unittest.mock import MagicMock
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from controllers.GroupController import GroupController
from utils.HttpStatus import HttpStatus

@pytest.fixture
def app():
    return Flask(__name__)

@pytest.fixture
def mock_group_service():
    return MagicMock()

@pytest.fixture
def mock_notification_service():
    return MagicMock()

@pytest.fixture
def mock_get_user_id():
    return MagicMock(return_value="mock_id")

@pytest.fixture
def controller(mock_group_service, mock_notification_service, mock_get_user_id):
    return GroupController(
        service=mock_group_service,
        notification_service=mock_notification_service,
        get_user_id_func=mock_get_user_id
    )

@pytest.fixture
def mock_auth(monkeypatch, controller):
    monkeypatch.setattr(
        controller,
        "get_user_id",
        lambda req: "7cbdb848-674f-4e20-a3d8-55e9df4bb036"
    )

#-----------------------------#
#        Create Group         #
#-----------------------------#
def test_create_group_success(app, controller, mock_group_service):
    # Arrange
    mock_group = MagicMock()
    mock_group.group_id = "g1"
    mock_group.group_name = "Test Group"
    mock_group.description = "desc"
    mock_group.invite_code = "ABC123"
    mock_group.members = ["user1"]

    mock_group_service.create_group.return_value = mock_group

    with app.test_request_context(
        '/group/create',
        method='POST',
        json={
            "group_name": "Test Group",
            "description": "desc"
        }
    ):
        # Act
        response, status = controller.create_group()
        data = response.get_json()

    # Assert
    assert status == HttpStatus.CREATED
    assert data["message"] == "Group created successfully"
    assert data["group_id"] == "g1"
    assert data["group_name"] == "Test Group"
    assert data["invite_code"] == "ABC123"


def test_create_group_unauthorized(app, controller, mock_get_user_id):
    # Arrange
    mock_get_user_id.return_value = None  # simulate no auth

    with app.test_request_context(
        '/group/create',
        method='POST',
        json={"group_name": "Test"}
    ):
        # Act
        response, status = controller.create_group()
        data = response.get_json()

    # Assert
    assert status == HttpStatus.UNAUTHORIZED
    assert data["error"] == "Unauthorized"


#-----------------------------#
#          Get Group          #
#-----------------------------#
def test_get_group_success(app, controller, mock_group_service):
    # Arrange
    mock_group_service.get_group.return_value = {
        "group_id": "g1",
        "group_name": "Test Group"
    }

    with app.test_request_context('/group/g1', method='GET'):
        # Act
        response, status = controller.get_group("g1")
        data = response.get_json()

    # Assert
    assert status == HttpStatus.OK
    assert "group" in data
    assert data["group"]["group_id"] == "g1"


def test_get_group_exception(app, controller, mock_group_service):
    # Arrange
    mock_group_service.get_group.side_effect = Exception("Something went wrong")

    with app.test_request_context('/group/g1', method='GET'):
        # Act
        response, status = controller.get_group("g1")
        data = response.get_json()

    # Assert
    assert status == HttpStatus.INTERNAL_SERVER_ERROR
    assert "error" in data

#-----------------------------#
#    Invite User to Group     #
#-----------------------------#
def test_invite_user_success(app, controller, mock_group_service, mock_auth):
    # Arrange
    mock_group_service.invite_user.return_value = True

    with app.test_request_context(
        '/group/invite',
        method='POST',
        json={
            "group_id": "g1",
            "username": "testuser"
        }):
        # Act
        response, status = controller.invite_user()
        data = response.get_json()
    
    # Assert
    assert status == HttpStatus.OK
    assert data["message"] == "Invite sent successfully"
    mock_group_service.invite_user.assert_called_once_with(
        group_id="g1",
        invited_by="7cbdb848-674f-4e20-a3d8-55e9df4bb036",
        username="testuser"
    )

def test_invite_user_failure(app, controller, mock_group_service, mock_auth):
    
    # Arrange
    mock_group_service.invite_user.return_value = False

    with app.test_request_context(
        '/group/invite',
        method='POST',
        json={
            "group_id": "g1",
            "username": "testuser"
        }):

        # Act
        response, status = controller.invite_user()
        data = response.get_json()

    # Assert
    assert status == HttpStatus.INTERNAL_SERVER_ERROR
    assert "error" in data
    mock_group_service.invite_user.assert_called_once_with(
        group_id="g1",
        invited_by="7cbdb848-674f-4e20-a3d8-55e9df4bb036",
        username="testuser"
    )

def test_invite_user_service_exception(app, controller, mock_group_service, mock_auth):
    # Arrange
    mock_group_service.invite_user.side_effect = Exception("User 'testuser' not found")

    with app.test_request_context(
        '/group/invite',
        method='POST',
        json={
            "group_id": "g1",
            "username": "testuser"
        }
    ):
        # Act
        response, status = controller.invite_user()
        data = response.get_json()

    # Assert
    assert status == HttpStatus.INTERNAL_SERVER_ERROR
    assert "error" in data
    assert data["error"] == "User 'testuser' not found"
    mock_group_service.invite_user.assert_called_once_with(
        group_id="g1",
        invited_by="7cbdb848-674f-4e20-a3d8-55e9df4bb036",
        username="testuser"
    )

#-----------------------------#
#         Join Group          #
#-----------------------------#
def test_join_group_success(app, controller, mock_group_service, mock_auth):
    # Arrange
    mock_group_service.join_group.return_value = True

    with app.test_request_context(
        'group/join',
        method='POST',
        json={
            "invite_code": "MOCKCODE"
        }
    ):
        # Act
        response, status = controller.join_group()
        data = response.get_json()
    # Assert
    assert status == HttpStatus.OK
    assert "message" in data
    assert "success" in data
    assert data['success'] == True

    # Check that service was actually called
    mock_group_service.join_group.assert_called_once_with(
        "MOCKCODE",
        "7cbdb848-674f-4e20-a3d8-55e9df4bb036"
    )

def test_join_group_exception(app, controller, mock_group_service, mock_auth):
    # Arrange
    mock_group_service.join_group.side_effect = Exception("User is already a member of this group")

    with app.test_request_context(
        "/group/join",
        method='POST',
        json={"invite_code": "MOCKCODE"}
    ):
        # Act
        response, status = controller.join_group()
        data = response.get_json()
    # Assert
    assert status == HttpStatus.BAD_REQUEST
    assert "error" in data
    assert data["error"] == "User is already a member of this group"
    # Check that service was actually called
    mock_group_service.join_group.assert_called_once_with(
        "MOCKCODE",
        "7cbdb848-674f-4e20-a3d8-55e9df4bb036"
    )

#-------------------------------#
#   Create Group Question Set   #
#-------------------------------#
def test_create_group_question_set_success(app, controller, mock_group_service, mock_notification_service, mock_auth):
    # Arrange
    mock_group_service.get_group.return_value = {
        "group_id": "g1",
        "members": ["member1-id", "member2-id"]
    }

    mock_response = MagicMock()
    mock_response.data = [{"game_id": "MOCK_GAME_ID"}]

    mock_group_service.create_game.return_value = mock_response

    with app.test_request_context(
        'group/create-game',
        method='POST',
        json={
            "group_id": "g1",
            "start_at": "2026-04-29T18:00:00Z",
            "duration_hours": 2,
            "question_count": 10
        }
    ):
        # Act
        response, status = controller.create_game()
        data = response.get_json()

    # Assert
    assert status == HttpStatus.CREATED
    assert data["message"] == "Group game created"
    mock_group_service.create_game.assert_called_once()
    assert mock_notification_service.create_notification.call_count == 2

def test_create_group_question_set_exception(app, controller, mock_group_service, mock_notification_service, mock_auth):
    pass