import { supabase } from "../components/supabaseClient";

export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  return user.user_metadata?.role === "admin";
};
