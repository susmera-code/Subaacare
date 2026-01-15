import { supabase } from "./supabaseClient";

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}
