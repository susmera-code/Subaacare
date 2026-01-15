import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validate = () => {
        if (!email || !password) {
            setError("Email and password are required");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format");
            return false;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

   const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
        // 1️⃣ Login using Supabase
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) throw loginError;

        const user = data.user;
        if (!user) throw new Error("User not found");

        // 2️⃣ Get role from user metadata
        const role = user.user_metadata?.role;
        if (!role) throw new Error("User role missing");

        // 3️⃣ Redirect based on role
        if (role === "patient") {
            navigate("/patient");
            
        } else if (role === "professional") {
            // Fetch professional profile
            const { data: profile, error: profileError } = await supabase
                .from("professionals")
                .select("profile_submitted, status")
                .eq("id", user.id)
                .single();

            if (profileError || !profile) throw new Error("Unable to fetch professional profile");

            // ✅ Redirect approved professionals to dashboard first
            if (profile.status === "approved") {
                navigate("/professionaldashboard");
            }
            // Profile not submitted yet
            else if (!profile.profile_submitted) {
                navigate("/professional"); // first-time login, fill profile
            }
            // Profile submitted but pending/rejected
            else {
                navigate("/professional");
            }
        } else if (role === "admin") {
            navigate("/admin");
        } else {
            throw new Error("Unknown user role");
        }
    } catch (err) {
        console.error("Login error:", err.message);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="login-container pb-4 d-flex align-items-center justify-content-center input-with-icon">
            <div className="login-card p-4 shadow-lg rounded-4 bg-white">
                <h3 className="text-center mb-1 fw-bold text-primary">Sign In</h3>
                <p className="fs-12 mb-3 login-message">
                    Welcome to Healthcare. Please login to your account.
                </p>

                <form onSubmit={handleLogin}>
                    {/* Email */}
                    <div className="mb-3 position-relative text-start fs-14">
                        <label className="fw-bold mb-1">Email</label>
                        <input
                            type="email"
                            className="form-control placeholder-custom"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <i className="bi bi-envelope-fill icon-right"></i>
                    </div>

                    {/* Password */}
                    <div className="mb-3 position-relative text-start fs-14">
                        <label className="fw-bold mb-1">Password</label>
                        <input
                            type="password"
                            className="form-control placeholder-custom"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <i className="bi bi-lock-fill icon-right"></i>
                    </div>

                    {/* Error */}
                    {error && <div className="text-danger fs-13 mb-2">{error}</div>}

                    <div className="text-end mb-3">
                        <a href="/forgot-password" className="fs-14">
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center mt-4 fs-14">
                    Don't have an account?{" "}
                    <a href="/register" className="text-link-600 fw-semibold">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
