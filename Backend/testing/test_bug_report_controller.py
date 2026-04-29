import pytest
from flask import Flask
from unittest.mock import Mock

from controllers.BugReportController import BugReportController, bug_report_bp
from utils.HttpStatus import HttpStatus


@pytest.fixture(scope="module")
def test_client():
    app = Flask(__name__)
    app.config["TESTING"] = True

    mock_service = Mock()
    mock_get_user_id = Mock(return_value="test-user-id")

    BugReportController(mock_service, mock_get_user_id)
    app.register_blueprint(bug_report_bp)

    return app.test_client(), mock_service, mock_get_user_id


def test_add_bug_report_success(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()
    mock_get_user_id.return_value = "test-user-id"

    response = client.post(
        "/bug-report/add",
        json={"bug_report": "The submit button does not work"}
    )

    assert response.status_code == HttpStatus.OK
    assert response.get_json() == {"message": "Bug report submitted"}

    mock_service.add_bug_report.assert_called_once_with(
        "test-user-id",
        "The submit button does not work"
    )


def test_add_bug_report_unauthorized(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()
    mock_get_user_id.return_value = None

    response = client.post(
        "/bug-report/add",
        json={"bug_report": "The page crashes"}
    )

    assert response.status_code == HttpStatus.UNAUTHORIZED
    assert response.get_json() == {"error": "Unauthorized"}

    mock_service.add_bug_report.assert_not_called()


def test_get_reports_success(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()
    mock_get_user_id.return_value = "test-user-id"

    fake_reports = [
        {
            "report_id": "report-1",
            "sender_id": "test-user-id",
            "bug_report": "Navbar is broken",
            "status": "OPEN"
        }
    ]

    mock_service.get_reports.return_value = fake_reports

    response = client.get("/bug-report/get-reports")

    assert response.status_code == HttpStatus.OK
    assert response.get_json() == {"reports": fake_reports}

    mock_service.get_reports.assert_called_once()


def test_remove_bug_report_success(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()
    mock_get_user_id.return_value = "test-user-id"

    response = client.delete(
        "/bug-report/remove",
        json={"report_id": "report-1"}
    )

    assert response.status_code == HttpStatus.OK
    assert response.get_json() == {"message": "Bug report deleted"}

    mock_service.remove_bug_report.assert_called_once_with("report-1")


def test_remove_bug_report_missing_report_id(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()

    response = client.delete(
        "/bug-report/remove",
        json={}
    )

    assert response.status_code == HttpStatus.BAD_REQUEST
    assert response.get_json() == {"error": "Missing report_id"}

    mock_service.remove_bug_report.assert_not_called()


def test_update_status_success(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()

    response = client.patch(
        "/bug-report/update-status",
        json={
            "report_id": "report-1",
            "status": "RESOLVED"
        }
    )

    assert response.status_code == HttpStatus.OK
    assert response.get_json() == {"message": "Bug report status updated"}

    mock_service.update_report.assert_called_once_with("report-1", "RESOLVED")


def test_update_status_missing_status(test_client):
    client, mock_service, mock_get_user_id = test_client
    mock_service.reset_mock()

    response = client.patch(
        "/bug-report/update-status",
        json={"report_id": "report-1"}
    )

    assert response.status_code == HttpStatus.BAD_REQUEST
    assert response.get_json() == {"error": "status is None"}

    mock_service.update_report.assert_not_called()