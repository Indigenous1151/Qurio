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
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchReports();
	}, []);

	return (
		<div>
			<Navbar />
			{/* Unauthorized or show bugs reports */}
			{isUnauthorized ? (
				<div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
					<p className="text-red-500">{error}</p>
				</div>
			) : (
				<div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
					<h1 className="text-3xl font-bold mb-6">Bug Reports</h1>

					{loading && <p>Loading...</p>}
					{error && <p className="text-red-500">{error}</p>}
					{!loading && !error && reports.length === 0 && <p>No bug reports found.</p>}

					{!loading && !error && reports.length > 0 && (
						<table className="min-w-full bg-white">
							<thead>
								<tr>
									<th className="py-2">Report ID</th>
									<th className="py-2">Sender ID</th>
									<th className="py-2">Text</th>
									<th className="py-2">Status</th>
								</tr>
							</thead>
							<tbody>
								{reports.map(report => (
									<tr key={report.report_id} className="text-left border-t">
										<td className="py-2">{report.report_id}</td>
										<td className="py-2">{report.sender_id}</td>
										<td className="py-2">{report.bug_report}</td>
										<td className="py-2">{report.status}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			)}

			<Footer />
		</div>
	);
};