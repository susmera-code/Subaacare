import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Password validation function
  const validatePassword = (pwd) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*]/;

    if (!minLength.test(pwd)) return "Password must be at least 8 characters long";
    if (!uppercase.test(pwd)) return "Password must include at least one uppercase letter";
    if (!lowercase.test(pwd)) return "Password must include at least one lowercase letter";
    if (!number.test(pwd)) return "Password must include at least one number";
    if (!specialChar.test(pwd)) return "Password must include at least one special character (!@#$%^&*)";

    return ""; // no error
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate password
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      sessionStorage.removeItem("recovery");
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="container">
      <h3>Reset Password</h3>
      <form className="w-50 text-start" onSubmit={handleReset}>
        <input
          className="form-control fs-15 mb-2"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="form-control fs-15 mb-2"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-success mt-2 fs-14">
          Update Password
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
