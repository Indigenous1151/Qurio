import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import "../details/AuthForms.css";
import { supabase } from '../supabaseClient/supabaseClient';

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://127.0.0.1:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || data.message || "Failed to sign in.");
        return;
      }

      // set supabase session on frontend
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        console.error("Supabase session error:", supabaseError);
      }

      setSuccessMessage("Successfully signed in!");
      console.log("Login response:", data);

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (error) {
      setErrorMessage("Unable to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-container">
        <p className="auth-top-text">
          Don't have an account?{" "}
          <Link to="/create-account" className="auth-link">
            Create account
          </Link>
        </p>

        <h2 className="auth-form-title">Sign In</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>

          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}