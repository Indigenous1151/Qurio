import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../supabaseClient/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

type PaymentConfig = {
  config_id: string;
  payment_type: string;
  is_active: boolean;
  created_at: string;
};

export function AdminPayment() {


  const navigate = useNavigate();
 // const [userId, setUserId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [newPaymentType, setNewPaymentType] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

  useEffect(() => {
  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/");
      return;
    }

    await fetchConfigs(); 
  };

  init();
}, []);

  const fetchConfigs = async () => {
  try {
    const token = await getToken();
    if (!token) return setError("Not authenticated");

    const res = await fetch(`${API_URL}/payment/admin/configs`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (res.ok) setConfigs(data.configs);
    else setError(data.error || "Failed to load.");
  } catch {
    setError("Failed to load configs.");
  }
};

 const handleAddConfig = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!newPaymentType.trim()) {
    setError("Please select a payment type.");
    return;
  }

  try {
    const token = await getToken();
    if (!token) return setError("Not authenticated");

    const res = await fetch(`${API_URL}/payment/admin/configure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ payment_type: newPaymentType })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`"${newPaymentType}" added!`);
      setNewPaymentType("");
      fetchConfigs();
    } else {
      setError(data.error || "Failed to add.");
    }
  } catch {
    setError("Failed to add payment method.");
  }
};

  const handleDelete = async (config_id: string, payment_type: string) => {
  setMessage("");
  setError("");

  try {
    const token = await getToken();
    if (!token) return setError("Not authenticated");

    const res = await fetch(`${API_URL}/payment/admin/configs/${config_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      setMessage(`"${payment_type}" removed.`);
      fetchConfigs();
    } else {
      setError("Failed to delete.");
    }
  } catch {
    setError("Failed to delete.");
  }
};
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-20">
        <button onClick={() => navigate("/")}
          className="text-sm text-[#638F77] font-semibold mb-6 bg-transparent border-none cursor-pointer hover:underline">
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Configure Payment Methods</h1>
        <p className="text-gray-500 mb-8">Manage available payment types</p>

        {message && <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-xl mb-4">{error}</div>}

        
        <div className="bg-[#638F77] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Add Payment Method</h2>
          <form onSubmit={handleAddConfig} className="flex gap-3">
            <select value={newPaymentType} onChange={(e) => setNewPaymentType(e.target.value)}
              className="flex-1 bg-white text-black rounded-xl px-4 py-2.5 text-sm cursor-pointer">
              <option value="">Select payment type</option>
              <option value="Visa">Visa</option>
              <option value="MasterCard">MasterCard</option>
            </select>
            <button type="submit"
              className="bg-white text-[#638F77] font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-gray-100">
              Add
            </button>
          </form>
        </div>

       
        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 text-[#1a1a1a]">Configured Payment Methods</h2>
          {configs.length === 0 ? (
            <p className="text-gray-400 text-sm">No payment methods configured yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {configs.map(config => (
                <div key={config.config_id}
                  className="flex justify-between items-center bg-[#f5f0e8] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1a1a1a]">{config.payment_type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${config.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {config.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(config.config_id, config.payment_type)}
                    className="text-red-500 text-sm font-semibold bg-transparent border-none cursor-pointer hover:text-red-700">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}