from database.SupabaseClient import SupabaseClient
from models.BugReport import BugReport
from typing import Any, cast

class BugReportRepository:
    def __init__(self, db_client: SupabaseClient):
        self.__db_client = db_client

    def save(self, bug_report: BugReport) -> bool:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")

            result = client.table("bug_reports").insert({
                "report_id": bug_report.report_id,
                "sender_id": bug_report.sender_id,
                "bug_report": bug_report.bug_report,
                "status": bug_report.status
            }).execute()

            print("INSERT RESULT:", result)

            if not result.data:
                raise Exception("Insert failed")

            return True
        except Exception as e:
            print(f"Error saving bug report: {e}")
            return False

    def get_reports(self, report_id: str) -> dict:
        try:
            client = self.__db_client.get_client()
            if not client:
                raise Exception("Database client is None")
            result = (
                client.table("bug_reports")
                .select("*")
                .eq("report_id", report_id)
                .execute()
            )
            if result.data and len(result.data) > 0:
                return result.data[0]

            return {}
        except Exception as e:
            print(f"Error fetching report: {e}")
            return {}

    def remove_bug_report(self, report_id: str) -> bool:
        try:
            client = self.__db_client.get_client()
            client.table("bug_reports") \
                .delete() \
                .eq("report_id", report_id) \
                .execute()
            return True
        except Exception as e:
            print(f"Error deleting report: {e}")
            return False