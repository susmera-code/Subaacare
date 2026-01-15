import { supabase } from "./supabaseClient";

export async function getUserProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("User not authenticated");

  const user = session.user;
  const role = user.user_metadata?.role;

  if (!role) throw new Error("User role missing");

  if (role === "professional") {
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("id", user.id) // ✅ match auth uid
      .maybeSingle(); // ✅ safe, returns null if not exists

    if (error) throw error;
    return { role, profile: data };
  }

  if (role === "patient") {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    return { role, profile: data };
  }

  if (role === "admin") {
    return { role, profile: user };
  }

  throw new Error("Unknown role");
}
