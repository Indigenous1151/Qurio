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

      const response = await fetch("http://localhost:5001/auth/register", {
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

      setSuccessMessage("Account created successfully! Please sign in.");
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
    <div>
      <div className="absolute top-[-150px] right-[8%] w-96 md:w-[32rem] h-96 md:h-[32rem] rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
      <div className="absolute top-18%] left-[-100px] w-64 md:w-[22rem] h-64 md:h-[22rem] rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
      <div className="absolute bottom-[-140px] left-[18%] w-80 md:w-[26rem] h-80 md:h-[26rem] rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
      <div className="absolute bottom-[22%] right-[-2%] w-36 md:w-52 h-36 md:h-52 rounded-full bg-[#638F77] opacity-10 pointer-events-none z-0" />
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
    </div>
  );
}