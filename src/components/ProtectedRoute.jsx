import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Support both new and old Supabase metadata
      const role = user.user_metadata?.role || user.raw_user_meta_data?.role;
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!userRole) return <Navigate to="/login" replace />;

  if (allowedRoles.length && !allowedRoles.includes(userRole))
    return <Navigate to="/login" replace />;

  return children;
}
