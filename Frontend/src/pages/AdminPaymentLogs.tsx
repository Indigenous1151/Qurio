import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/Footer";
import { supabase } from "../supabaseClient/supabaseClient";
import { formatCurrency } from "../utils/formatCurrency";

import { AdminTable } from "../components/admin/AdminTable";
import { StatusBadge } from "../components/admin/StatusBadge";

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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<PaymentRecord[]>([]);
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

  useEffect(() => {
    if (!isAdmin) return;

    const fetchLogs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Not authenticated");
        }

        const res = await fetch(`${API_URL}/payment/admin/logs`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch payment logs");

        const data = await res.json();

        const mapped = data.payments.map((log: any) => ({
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

        setLogs(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [logs]);

  const start = (currentPage - 1) * itemsPerPage;
  const pageData = logs.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div>
      <Navbar />

      <AdminTable
        title="Admin Payment Logs"
        data={pageData}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        rowKey={(r) => r.payment_id}
        columns={[
          { header: "Payment ID", accessor: (r) => r.payment_id },
          { header: "Code", accessor: (r) => r.payment_code },
          { header: "User ID", accessor: (r) => r.user_id },
          { header: "Email", accessor: (r) => r.email },
          { header: "Price", accessor: (r) => formatCurrency(r.price) },
          { header: "Currency", accessor: (r) => r.currency_purchased },
          { header: "Type", accessor: (r) => r.payment_type },
          { header: "Timestamp", accessor: (r) => r.timestamp },
          {
            header: "Status",
            accessor: (r) => <StatusBadge status={r.status} />,
          },
        ]}
      />

      <Footer />
    </div>
  );
}