import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    // ❌ Password reset request
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password", // the route in your app
    });

    if (error) setError(error.message);
    else setMessage("Password reset email sent! Check your inbox.");
  };

  return (
    <div className="container">
      <h4 className="text-start mb-3">Forgot Password</h4>
      <form onSubmit={handleReset}>
        <div className="row">
          <div className="col-md-6">
            <input className="form-control placeholder-custom"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            /></div>
          <div className="col-md-4 text-start ">
            <button className="btn btn-primary fs-14" type="submit">Send reset link</button>
          </div></div>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
