import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const accessToken = searchParams.get("access_token");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password) {
      setError("Enter a new password");
      return;
    }

    const { error } = await supabase.auth.updateUser(
      { password },
      accessToken && { accessToken }
    );

    if (error) setError(error.message);
    else {
      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <div className="container">
      <h3>Reset Password</h3>
      <form className="w-50 text-start" onSubmit={handleReset}>
        <input className="form-control fs-15"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-success mt-2 fs-14">Update Password</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
