import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../supabaseClient/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

type PaymentRecord = {
  payment_id: string;
  payment_code: string;
  user_id: string;
  email: string;
  price: number;
  currency_purchased: number;
  payment_type: string;
  timestamp: string;
  status: string;
};

export function AdminPaymentLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // you can tweak this

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_URL}/payment/admin/logs`, { headers });
        
        if (response.status === 401) {
          setIsUnauthorized(true);
          setError("Unauthorized: You do not have permission to access this page.");
          setLoading(false);
          return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch payment logs');
        const data = await response.json();
        // Map the data to match the type
        const mappedLogs = data.payments.map((log: any) => ({
          payment_id: log.payment_id,
          payment_code: log.payment_code,
          user_id: log.user_id,
          email: log.email,
          price: log.amount,
          currency_purchased: log.currency_purchased,
          payment_type: log.payment_type,
          timestamp: log.created_at,
          status: log.status,
        }));
        setLogs(mappedLogs);
      } catch (err) {
        // Suppress logging for expected authorization errors
        if (!(err instanceof Error && err.message === "Unauthorized: You do not have permission to access this page.")) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Needed when filtering/searching logs, but also ensures we reset to page 1 when logs change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when logs change
  }, [logs]);

  if (loading) return <div>Loading...</div>;
  
  if (isUnauthorized) {
    return (
      <div>
        <Navbar />
        <div className="admin-logs-container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Access Denied</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#638F77',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Return to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) return (
    <div>
      <Navbar />
      <div className="admin-logs-container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#d32f2f' }}>Error</h1>
        <p>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#638F77',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Return to Home
        </button>
      </div>
      <Footer />
    </div>
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div>
      <Navbar />
      <div className="admin-logs-container" style={{ paddingTop: '2rem' }}>
        <h1>Admin Payment Logs</h1>
        <table className="logs-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Payment Code</th>
              <th>User ID</th>
              <th>Email</th>
              <th>Price</th>
              <th>Currency Purchased</th>
              <th>Payment Type</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr key={log.payment_id}>
                <td>{log.payment_id}</td>
                <td>{log.payment_code}</td>
                <td>{log.user_id}</td>
                <td>{log.email}</td>
                <td>{log.price}</td>
                <td>{log.currency_purchased}</td>
                <td>{log.payment_type}</td>
                <td>{log.timestamp}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}