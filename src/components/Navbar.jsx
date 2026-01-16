import { useAuth } from "./useAuth";
import { logout } from "./logout";
import Subaa_Logo from "./assets/Subaa_Logo.png";
import { supabase } from './supabaseClient';
const Navbar = () => {
    const { user, role, loading } = useAuth();

    if (loading) return null;

    // Function to get initials
    const getInitials = (fullName, fallback) => {
        const name = fullName?.trim() || fallback?.trim() || "?";

        const words = name.split(/\s+/);

        // If more than 1 word, take first letter of first and last word
        if (words.length > 1) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }

        // If only 1 word, take first 2 letters
        return name.slice(0, 2).toUpperCase();
    };


    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light pt-0 pb-0 nav-style">
            <div className="container-fluid">
                <a href="#" target="_blank" className="navbar-brand mr-2">
                    <img src={Subaa_Logo} alt="Logo" className="logo" style={{ height: "3.5rem", padding: "0" }} />;
                </a>
                <div className="text-start">
                    <a className="navbar-brand fw-bold text-blue" href="#/home">Subaa Care</a>
                    <p className="fs-12 text-blue mb-0 mt-0">We care those who you care</p>
                </div>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">

                        {/* Always visible */}
                        <li className="nav-item">
                            <a className="nav-link" href="/home">Home</a>
                        </li>

                        {/* NOT LOGGED IN */}
                        {!user && (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="/register">Register</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/login">Sign In</a>
                                </li>
                            </>
                        )}

                        {/* Logged-in role-based links */}
                        {user && role === "patient" && (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="/patient">Dashboard</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/myappointments">My Appointments</a> </li>
                            </>
                        )}
                        {user && role === "professional" && (
                            <li className="nav-item">
                                <a className="nav-link" href="/professionaldashboard">Dashboard</a>
                            </li>
                        )}
                        {user && role === "admin" && (
                            <li className="nav-item">
                                <a className="nav-link" href="/admin">Admin Panel</a>
                            </li>
                        )}

                        {/* Avatar Dropdown */}
                        {user && (
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle d-flex align-items-center justify-content-center"
                                    href="#!"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--bs-gray-200)",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                        textAlign: "center",
                                        lineHeight: "40px",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                    }}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="avatar"
                                            className="rounded-circle"
                                            width="40"
                                            height="40"
                                        />
                                    ) : (
                                        getInitials(user.user_metadata?.full_name, user.email || role)
                                    )}


                                </a>

                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    {user && role === "professional" && (
                                        <><li><a className="dropdown-item" href="/professional">My Profile</a></li>
                                            <li><hr className="dropdown-divider" /></li></>)}
                                    {user && role === "patient" && (
                                        <><li><a className="dropdown-item" href="/patientprofile">My Profile</a></li>
                                            <li><hr className="dropdown-divider" /></li></>)}

                                    <li>
                                        <button className="dropdown-item text-danger" onClick={logout}>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
