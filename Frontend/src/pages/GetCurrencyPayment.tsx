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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!selectedMethod || !cardNumber || !cardName || !expiry || !cvv) {
      setError("Please fill in all fields.");
      return;
    }
  
    if (!packageData) {
      setError("No package selected.");
      return;
    }
  
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError || !session?.access_token) {
        setError("You must be signed in.");
        return;
      }
  
      const response = await fetch("http://127.0.0.1:5001/payment/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: packageData.price,
          currency_purchased: packageData.coins,
          payment_type: selectedMethod,
          card_number: cardNumber,
          expiry: expiry,
          cvv: cvv,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        setError(result.error || "Payment failed.");
        return;
      }
  
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Payment error:", err);
      setError("Something went wrong while processing payment.");
    }
  };

  return (
    <div className="payment-page">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6">Payment Required</h1>

        <form onSubmit={handleSubmit} className="payment-form">

          {packageData && (
            <div className="total-box">
              <h2>Order Summary</h2>
              <p>{packageData.coins} coins</p>
              <p><strong>Total: ${packageData.price.toFixed(2)}</strong></p>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}

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
            <p>Your coins have been added to your account!</p>

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