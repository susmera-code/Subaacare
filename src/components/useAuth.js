import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      setUser(sessionUser);
      setRole(sessionUser?.user_metadata?.role || null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setRole(session?.user?.user_metadata?.role || null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, role, loading };
};
