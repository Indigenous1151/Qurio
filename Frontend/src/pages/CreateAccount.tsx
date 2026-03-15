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

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Empty field(s). Please fill in all required information.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSuccessMessage("Account form submitted successfully.");

    console.log({
      username,
      email,
      password,
      confirmPassword,
    });
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

          <button className="auth-button" type="submit">
            Get Started!
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}