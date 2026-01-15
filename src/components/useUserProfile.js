import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const user = session.user;
      const role = user.user_metadata?.role;
      setRole(role);

      let table =
        role === "patient"
          ? "patients"
          : role === "professional"
          ? "professionals"
          : null;

      if (!table) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .single(); // RLS: id = auth.uid()

      if (!error) setProfile(data);
      setLoading(false);
    };

    loadProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(
      () => loadProfile()
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { profile, role, loading };
}
