// functions/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

// Load Supabase secrets
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Create a server-side Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointment } = await req.json();

    // ✅ Add console.log here to debug the incoming appointment
    console.log("Appointment received:", appointment);

    // Fetch professional email
    const { data: professional, error: profErr } = await supabase
      .from("professionals")
      .select("email")
      .eq("id", appointment.professional_id)
      .single();

    // ✅ Add console.log here to check professional email
    console.log("Professional email:", professional?.email);

    // Fetch patient info
    const { data: patient, error: patientErr } = await supabase
      .from("patients")
      .select("full_name, email")
      .eq("id", appointment.patient_id)
      .single();

    // ✅ Add console.log here to check patient info
    console.log("Patient info:", patient);

    // Insert into emails table
    const { error: emailErr } = await supabase
      .from("emails")
      .insert({
        from: "noreply@yourdomain.com",
        to: professional.email,
        subject: "New Appointment Booked",
        html: `
          <p>Hello,</p>
          <p>A patient has booked an appointment:</p>
          <ul>
            <li>Name: ${patient.full_name}</li>
            <li>Email: ${patient.email}</li>
            <li>Date: ${new Date(appointment.from_datetime).toLocaleDateString()}</li>
            <li>Time: ${new Date(appointment.from_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(appointment.to_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
          </ul>
        `
      });

    if (emailErr) throw emailErr;

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  }catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
}

});

