import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import "../details/AuthForms.css";

export function SignIn() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!emailOrUsername.trim() || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setSuccessMessage("Sign in form submitted successfully.");

    console.log({
      emailOrUsername,
      password,
    });
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
            placeholder="Username or Email"
            value={emailOrUsername}
            onChange={(event) => setEmailOrUsername(event.target.value)}
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

          <button className="auth-button" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}