import uuid

class BugReport:
    def __init__(self, sender_id: str, bug_report: str = "", status: str = "INCOMPLETE"):
        self.report_id = str(uuid.uuid4())
        self.sender_id = sender_id
        self.bug_report = bug_report
        self.status = status

    def get_report(self) -> str:
        return self.bug_report

    def get_status(self) -> str:
        return self.status

    def set_status(self, status: str) -> None:
        if status not in ["COMPLETE", "INCOMPLETE"]:
            raise ValueError("Invalid Status")
        else:
            self.status = status

    def to_dict(self) -> dict:
        return self.__dict__