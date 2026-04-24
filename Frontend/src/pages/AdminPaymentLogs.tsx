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
        const response = await fetch(`${API_URL}/admin/logs`, { headers });
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
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Navbar />
      <div className="admin-logs-container">
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
            {logs.map((log) => (
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
      </div>
      <Footer />
    </div>
  );
}