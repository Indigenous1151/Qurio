from BugReportRepository import BugReportRepository
from models.BugReport import BugReport

class BugReportService:
    def __init__(self, bug_report_repo: BugReportRepository):
        self.__repo = bug_report_repo

    def add_bug_report(self, sender_id: str, report_text: str) -> bool:
        report = BugReport(sender_id=sender_id, bug_report=report_text)
        success = self.__repo.save(report)
        if not success:
            raise Exception("Failed to save bug report")
        return True

    def get_reports(self, user_id: str) -> list:
        return self.__repo.get_reports(user_id)
    
    def remove_bug_report(self, report_id: str) -> bool:
        success = self.__repo.remove_bug_report(report_id)
        if not success:
            raise Exception("Failed to delete bug report")
        return True