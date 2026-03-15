import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import "../details/AuthForms.css";

export function CreateAccount() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage("Empty field(s). Please fill in all required information.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || data.message || "Failed to create account.");
        return;
      }

      setSuccessMessage("Account created successfully! Please verify email and sign in.");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
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
          Already have an account?{" "}
          <Link to="/sign-in" className="auth-link">
            Sign in
          </Link>
        </p>

        <h2 className="auth-form-title">Create Account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
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

          <input
            className="auth-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Get Started!"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}