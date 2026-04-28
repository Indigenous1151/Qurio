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
def mock_service():
    return MagicMock()

@pytest.fixture
def mock_get_user_id():
    return MagicMock(return_value="mock_id")

@pytest.fixture
def controller(mock_service, mock_get_user_id):
    return GroupController(service=mock_service, get_user_id_func=mock_get_user_id)


#-----------------------------#
#        Create Group         #
#-----------------------------#
def test_create_group_success(app, controller, mock_service):
    # Arrange
    mock_group = MagicMock()
    mock_group.group_id = "g1"
    mock_group.group_name = "Test Group"
    mock_group.description = "desc"
    mock_group.invite_code = "ABC123"
    mock_group.members = ["user1"]

    mock_service.create_group.return_value = mock_group

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
def test_get_group_success(app, controller, mock_service):
    # Arrange
    mock_service.get_group.return_value = {
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


def test_get_group_exception(app, controller, mock_service):
    # Arrange
    mock_service.get_group.side_effect = Exception("Something went wrong")

    with app.test_request_context('/group/g1', method='GET'):
        # Act
        response, status = controller.get_group("g1")
        data = response.get_json()

    # Assert
    assert status == HttpStatus.INTERNAL_SERVER_ERROR
    assert "error" in data