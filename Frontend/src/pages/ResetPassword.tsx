import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { supabase } from "../supabaseClient/supabaseClient";
import "../details/AuthForms.css";

export function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Failed to reset password.");
        return;
      }

      setSuccessMessage("Password reset successfully.");

      setTimeout(() => {
        navigate("/sign-in");
      }, 1200);
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage("Unable to reset password.");
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
          Back to{" "}
          <Link to="/sign-in" className="auth-link">
            Sign in
          </Link>
        </p>

        <h2 className="auth-form-title">Reset Password</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button className="auth-button" type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </AuthLayout>
    </div>
  );
}