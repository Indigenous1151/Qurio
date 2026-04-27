import { useState } from "react";

type BugReport = {
  report_id: string;
  status: "INCOMPLETE" | "COMPLETE";
};

type Props = {
  report: BugReport;
  onUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
};

export function BugReportActions({ report, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  const toggleStatus =
    report.status === "COMPLETE" ? "INCOMPLETE" : "COMPLETE";

  return (
    <div className="relative inline-block text-left">
      {/* 3-dot button */}
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 rounded hover:bg-gray-100 text-lg"
      >
        ⋮
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              onUpdate(report.report_id, toggleStatus);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Mark {toggleStatus}
          </button>

          <button
            onClick={() => {
              onDelete(report.report_id);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}