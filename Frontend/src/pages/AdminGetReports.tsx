import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../supabaseClient/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

type BugReport = {
  report_id: string;
  sender_id: string;
  bug_report: string;
  status: "INCOMPLETE" | "COMPLETE";
};

export function AdminGetReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) throw new Error("Not authenticated");

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_URL}/bug-report/get-reports`, { headers });

        if (response.status === 401) {
          setIsUnauthorized(true);
          setError("Unauthorized: You do not have permission to access this page.");
          setLoading(false);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch bug reports');

        const data = await response.json();
        setReports(data.reports);
      } catch (err) {
        if (!(err instanceof Error && err.message.includes("Unauthorized"))) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [reports]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (isUnauthorized) {
    return (
      <div>
        <Navbar />
        <div className="pt-10 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#638F77] text-white rounded-lg hover:bg-[#557a65] transition"
          >
            Return to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="pt-10 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#638F77] text-white rounded-lg hover:bg-[#557a65] transition"
          >
            Return to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-bold mb-6">Admin Bug Reports</h1>

        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Sender ID</th>
                <th className="px-4 py-3">Bug Report</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report) => (
                <tr key={report.report_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{report.report_id}</td>
                  <td className="px-4 py-3">{report.sender_id}</td>
                  <td className="px-4 py-3">{report.bug_report}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        report.status === "COMPLETE"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}