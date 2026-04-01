import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import "../details/AuthForms.css";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5001/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || data.message || "Failed to send reset email.");
        return;
      }

      setSuccessMessage("Password reset email sent. Please check your inbox.");
      setEmail("");
    } catch (error) {
      setErrorMessage("Unable to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="absolute top-[-150px] right-[8%] w-96 md:w-[32rem] h-96 md:h-[32rem] rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
      <div className="absolute top-18%] left-[-100px] w-64 md:w-[22rem] h-64 md:h-[22rem] rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
      <div className="absolute bottom-[-140px] left-[18%] w-80 md:w-[26rem] h-80 md:h-[26rem] rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
      <div className="absolute bottom-[22%] right-[-2%] w-36 md:w-52 h-36 md:h-52 rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />

    <AuthLayout>
      <div className="auth-form-container">
        <p className="auth-top-text">
          Back to {" "}
          <Link to="/sign-in" className="auth-link">
            Sign In
          </Link>
        </p>

        <h2 className="auth-form-title">Forgot Password</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
      </div>
    </AuthLayout>
    </div>
  );
}