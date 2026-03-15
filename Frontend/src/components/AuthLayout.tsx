import type { ReactNode } from "react";
import "../details/AuthLayout.css";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-left">
          <div className="auth-card-brand">
            <p className="auth-card-welcome">welcome to</p>
            <h1 className="auth-card-title">QURIO</h1>
          </div>
        </div>

        <div className="auth-card-right">
          {children}
        </div>
      </div>
    </div>
  );
}