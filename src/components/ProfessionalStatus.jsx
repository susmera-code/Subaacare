import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ProfessionalStatus() {
  const [status, setStatus] = useState("loading");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("professionals")
        .select("status, rejection_reason, profile_submitted")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // NOT SUBMITTED
      if (!data.profile_submitted) {
        setStatus("not_submitted");
        return;
      }

      // SUBMITTED → ADMIN STATUS
      setStatus(data.status || "pending");
      setRejectionReason(data.rejection_reason || "");
    } catch (err) {
      console.error("Failed to fetch professional status:", err.message);
      setStatus("not_submitted");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span className="fs-14">Loading status...</span>;
  }

  let badge;
  switch (status) {
    case "not_submitted":
      badge = <span className="badge bg-danger p-2 fs-16">Not Submitted</span>;
      break;
    case "pending":
      badge = <span className="badge bg-warning text-dark p-2 fs-14">Pending Approval</span>;
      break;
    case "approved":
      badge = <span className="badge bg-info p-2 fs-14">Approved</span>;
      break;
    case "rejected":
      badge = <span className="badge bg-danger p-2 fs-14">Rejected</span>;
      break;
    default:
      badge = <span className="badge bg-danger p-2 fs-14">Unknown</span>;
  }

  return (
    <div>
      <span className="fs-16 fw-semibold text-blue">Profile Status: </span>
      {badge}

      {status === "rejected" && rejectionReason && (
        <p className="text-danger fw-semibold mt-2 fs-16">
          Reason: {rejectionReason}
        </p>
      )}
    </div>
  );
}
