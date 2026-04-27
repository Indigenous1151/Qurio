import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/Footer";
import { supabase } from "../supabaseClient/supabaseClient";

import { AdminTable } from "../components/admin/AdminTable";
import { StatusBadge } from "../components/admin/StatusBadge";
import { BugReportActions } from "../components/admin/BugReportActions";

const API_URL = import.meta.env.VITE_API_URL;

type BugReport = {
  report_id: string;
  sender_id: string;
  bug_report: string;
  status: "INCOMPLETE" | "COMPLETE";
};

export function AdminGetReports() {
	const navigate = useNavigate();
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

	useEffect(() => {
		const checkAdmin = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();

				if (!session?.access_token) {
					navigate("/");
					return;
				}

				const res = await fetch(`${API_URL}/payment/admin/is-admin`, {
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				});

				if (!res.ok) {
					navigate("/");
					return;
				}

				const data = await res.json();

				if (!data.is_admin) {
					navigate("/");
					return;
				}

				setIsAdmin(true);
			} catch {
				navigate("/");
			}
		};

		checkAdmin();
	}, []);

	// Fetch bug reports once we know the user is an admin
  useEffect(() => {

		if (!isAdmin) return;

    const fetchReports = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Not authenticated");
        }

        const res = await fetch(`${API_URL}/bug-report/get-reports`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch bug reports");

        const data = await res.json();
        setReports(data.reports);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reports]);

  const start = (currentPage - 1) * itemsPerPage;
  const pageData = reports.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

	const handleUpdateStatus = async (id: string, status: string) => {
		try {
			const { data: { session } } = await supabase.auth.getSession();

			await fetch(`${API_URL}/bug-report/update-status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session?.access_token}`,
				},
				body: JSON.stringify({
					report_id: id,
					status,
				}),
			});

			setReports((prev) =>
				prev.map((r) =>
					r.report_id === id ? { ...r, status: status as any } : r
				)
			);
		} catch (err) {
			console.error(err);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const { data: { session } } = await supabase.auth.getSession();

			await fetch(`${API_URL}/bug-report/remove`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session?.access_token}`,
				},
				body: JSON.stringify({ report_id: id }),
			});

			setReports((prev) => prev.filter((r) => r.report_id !== id));
		} catch (err) {
			console.error(err);
		}
	};

  return (
    <div>
      <Navbar />

      <AdminTable
        title="Bug Reports"
        data={pageData}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        rowKey={(r) => r.report_id}
        columns={[
          { header: "Report ID", accessor: (r) => r.report_id },
          { header: "Sender ID", accessor: (r) => r.sender_id },
          { header: "Bug Report", accessor: (r) => r.bug_report },
          {
            header: "Status",
            accessor: (r) => <StatusBadge status={r.status} />,
          },
					{
						header: "Actions",
						accessor: (r) => (
							<BugReportActions
								report={r}
								onUpdate={handleUpdateStatus}
								onDelete={handleDelete}
							/>
						),
					}
        ]}
      />

      <Footer />
    </div>
  );
}