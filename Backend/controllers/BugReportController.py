from flask import Blueprint, request, jsonify, current_app
from utils.HttpStatus import HttpStatus
from models.Statistics import Statistics
from services.BugReportService import BugReportService

bug_report_bp = Blueprint('bug_report', __name__, url_prefix='/bug-report')

class BugReportController:
    def __init__(self, service: BugReportService,get_user_id_func):
        self.__service: BugReportService = service
        self.__register_routes()
        self.get_user_id = get_user_id_func

    def __register_routes(self):
        bug_report_bp.add_url_rule('/add', 'add_bug_report', self.add_bug_report, methods=['POST']) 
        bug_report_bp.add_url_rule('/get-reports', 'get_reports', self.get_reports, methods=['GET'])
        bug_report_bp.add_url_rule('/remove', 'remove_bug_report', self.remove_bug_report, methods=['DELETE'])
        bug_report_bp.add_url_rule('/update-status', 'update_status', self.update_status, methods=['PATCH'])

    def add_bug_report(self):
        print("DEBUG: called add bug report")
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            data = request.get_json()
            report_text = data.get("bug_report")

            if not report_text:
                return jsonify({"error": "Missing bug_report"})

            sender_id = user_id

            self.__service.add_bug_report(sender_id, report_text)

            return jsonify({"message": "Bug report submitted"})

        except Exception as e:
            return jsonify({"error": str(e)})

    def get_reports(self):
        try:
            user_id = self.get_user_id(request)
            if not user_id:
                return jsonify({"error": "Unauthorized"}), HttpStatus.UNAUTHORIZED

            reports = self.__service.get_reports()

            return jsonify({"reports": reports}), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def remove_bug_report(self):
        try:
            data = request.get_json()
            report_id = data.get("report_id")

            if not report_id:
                return jsonify({"error": "Missing report_id"}), HttpStatus.BAD_REQUEST

            self.__service.remove_bug_report(report_id)

            return jsonify({"message": "Bug report deleted"}), HttpStatus.OK

        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR

    def update_status(self):
        """Converts status of bug report to the new status passing in the request."""
        try:
            data = request.get_json()
            report_id = data.get("report_id")
            status = data.get("status")

            if not report_id:
                return jsonify({"error": "Missing report_id"}), HttpStatus.BAD_REQUEST

            if not status:
                return jsonify({"error": "status is None"}), HttpStatus.BAD_REQUEST

            self.__service.update_report(report_id, status)
            return jsonify({"message": "Bug report status updated"}), HttpStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HttpStatus.INTERNAL_SERVER_ERROR