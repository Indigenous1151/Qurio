import { useEffect, useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/Payment.css';
import { supabase } from '../supabaseClient/supabaseClient';
import { useLocation, useNavigate } from "react-router-dom";

export function GetCurrencyPayment() {

  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const location = useLocation();
  const packageData = location.state as {
    coins: number;
    price: number;
  } | null;

  useEffect(() => {
    const fetchPaymentTypes = async () => {
      const { data, error } = await supabase
        .from("payment_config")
        .select("payment_type, is_active");

      if (error) {
        setError(error.message);
        return;
      }

      const activeTypes = (data || [])
        .filter((c) => c.is_active)
        .map((c) => c.payment_type);

      setPaymentMethods(activeTypes);
    };

    fetchPaymentTypes();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedMethod || !cardNumber || !cardName || !expiry || !cvv) {
      return setError("Please fill in all fields.");
    }

    // simulate success
    setShowSuccessModal(true);
  };

  return (
    <div className="payment-page">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6">Payment Required</h1>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="payment-form">

          {packageData && (
            <div className="total-box">
              <h2>Order Summary</h2>
              <p>{packageData.coins} coins</p>
              <p><strong>Total: ${packageData.price.toFixed(2)}</strong></p>
            </div>
          )}

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="input-field"
          >
            <option value="">Select Card Type</option>
            {paymentMethods.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="input-field"
          />

          <input
            type="text"
            placeholder="Cardholder Name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="input-field"
          />

          <div className="card-row">
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="input-field small"
            />

            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              className="input-field small"
            />
          </div>

          <button type="submit" className="update-button">
            Confirm Payment
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Payment Successful!</h2>
            <p>Your coins will be added to your account shortly!</p>

            <button
              className="modal-button"
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}