import { supabase } from "./supabaseClient"; // your supabase client

const searchProfessionals = async () => {
  setSearching(true);
  try {
    // 1️⃣ Query professionals
    let query = supabase
      .from("professionals")       // make sure this matches the exact table name
      .select("id, full_name, category, state, status"); // "state" instead of "location"

    if (category) query = query.eq("category", category);
    if (location) query = query.ilike("state", `%${location}%`);

    const { data: professionals, error: profError } = await query;
    if (profError) throw profError;

    let filteredResults = [];

    // 2️⃣ For each professional, check availability
    for (let prof of professionals) {
      const { data: availability, error: availError } = await supabase
        .from("availability")           // match exact table name
        .select("from_time, to_time")
        .eq("professional_id", prof.id)
        .gte("from_time", fromDate || "1900-01-01T00:00")
        .lte("to_time", toDate || "2999-12-31T23:59");

      if (availError) {
        console.error(availError);
        continue; // skip this professional if error
      }

      if (availability && availability.length > 0) {
        filteredResults.push({ ...prof, availability });
      }
    }

    setResults(filteredResults);
  } catch (err) {
    console.error("Search error:", err.message);
  } finally {
    setSearching(false);
  }
};
