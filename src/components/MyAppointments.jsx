import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { startRazorpayPayment } from "../utils/razorpay";
const formatDateTime = (datetime) => {
  if (!datetime) return "";
  const d = new Date(datetime);
  const date = d.toLocaleDateString("en-GB");
  const time = d.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFrom, setEditFrom] = useState("");
  const [editTo, setEditTo] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAppt, setCancelAppt] = useState(null);

  // Open cancel modal
  const openCancelModal = (appt) => {
    setCancelAppt(appt);
    setShowCancelModal(true);
  };

  // Confirm cancellation
  const confirmCancel = async () => {
    if (!cancelAppt) return;
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", cancelAppt.id);

    if (error) {
      alert("Failed to cancel appointment");
      return;
    }

    setAppointments((prev) => prev.filter((a) => a.id !== cancelAppt.id));
    setShowCancelModal(false);
    setCancelAppt(null);
  };

  const toInputDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  const startEdit = (appt) => {
    setEditingId(appt.id);
    setEditFrom(toInputDateTime(appt.from_datetime));
    setEditTo(toInputDateTime(appt.to_datetime));
  };

  const saveEdit = async (id) => {
    if (!editFrom || !editTo) return alert("Select both date & time");

    const { data, error } = await supabase
      .from("appointments")
      .update({
        from_datetime: editFrom.replace("T", " "),
        to_datetime: editTo.replace("T", " "),
      })
      .eq("id", id)
      .select();

    if (error) return alert(error.message);
    if (!data || data.length === 0) return alert("Update blocked by policy");

    setEditingId(null);
    fetchAppointments(userId);
  };

  // Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAppointments([]); setLoading(false); return; }
      setUserId(user.id);
      fetchAppointments(user.id);
    };
    getUser();
  }, []);

  // Fetch appointments
  const fetchAppointments = async (patientId) => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        from_datetime,
        to_datetime,
        status,
        professionals!inner(
          full_name,
          profile_photo,
          category,
          city,
          state
        )
      `)
      .eq("patient_id", patientId)
      .order("from_datetime", { ascending: true });

    if (error) setAppointments([]);
    else setAppointments(data || []);
    setLoading(false);
  };


  // Split appointments
  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.from_datetime) >= now);
  const past = appointments.filter(a => new Date(a.from_datetime) < now);

  // 1️⃣ Load Razorpay SDK ONCE
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  // 2️⃣ Payment handler
  const payNow = async () => {
  };
  if (loading) return <p>Loading your appointments...</p>;

  return (
    <div className="container mt-3">
      <h4 className="fw-semibold mb-4 text-blue">My Appointments</h4>

      <div className="accordion" id="appointmentsAccordion">

        {/* Upcoming Appointments */}
        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="upcomingHeading">
            <button className="accordion-button text-blue fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#upcomingCollapse" aria-expanded="true" aria-controls="upcomingCollapse">
              Upcoming Appointments({upcoming.length})
            </button>
          </h2>
          <div id="upcomingCollapse" className="accordion-collapse collapse show" aria-labelledby="upcomingHeading" data-bs-parent="#appointmentsAccordion">
            <div className="accordion-body d-flex flex-column gap-3">
              {upcoming.length === 0 && <p className="text-muted">No upcoming appointments</p>}
              {upcoming.map(appt => (
  <AppointmentCard
    key={appt.id}
    appt={appt}
    editingId={editingId}
    startEdit={startEdit}
    saveEdit={saveEdit}
    openCancelModal={openCancelModal}
    editFrom={editFrom}
    setEditFrom={setEditFrom}
    editTo={editTo}
    setEditTo={setEditTo}
    formatDateTime={formatDateTime} // 👈 pass it
  />
))}

            </div>
          </div>
        </div>

        {/* Past Appointments */}
        <div className="accordion-item mb-3">
          <h2 className="accordion-header" id="pastHeading">
            <button className="accordion-button collapsed text-blue fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#pastCollapse" aria-expanded="false" aria-controls="pastCollapse">
              Past Appointments({past.length})
            </button>
          </h2>
          <div id="pastCollapse" className="accordion-collapse collapse" aria-labelledby="pastHeading" data-bs-parent="#appointmentsAccordion">
            <div className="accordion-body d-flex flex-column gap-3">
              {past.length === 0 && <p className="text-muted">No past appointments</p>}
              {past.map(appt => <AppointmentCard key={appt.id} appt={appt} editingId={editingId} startEdit={startEdit} saveEdit={saveEdit} openCancelModal={openCancelModal} editFrom={editFrom} setEditFrom={setEditFrom} editTo={editTo} setEditTo={setEditTo} />)}
            </div>
          </div>
        </div>

      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Appointment</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this appointment?<br /><strong>This action cannot be undone.</strong></p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>No</button>
                <button className="btn btn-danger" onClick={confirmCancel}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ---------------- Appointment Card Component ----------------
const AppointmentCard = ({ appt, editingId, startEdit, saveEdit, openCancelModal, editFrom, setEditFrom, editTo, setEditTo }) => {
 const isUpcoming = new Date(appt.from_datetime) >= new Date();

  const statusColor =
    appt.status === "accepted" ? "bg-success" :
    appt.status === "pending" ? "bg-warning text-dark" :
    "bg-danger";

  return (
    <div className="card shadow-sm border-0 p-0" style={{ borderRadius: "12px" }}>
      <div className="card-body row gy-3 align-items-start">
        {/* LEFT SIDE */}
        <div className="d-flex gap-3 col-md-5 text-start align-items-center border-end">
          <img
            src={appt.professionals?.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.professionals?.full_name || "User")}`}
            alt="Professional"
            className="rounded-circle"
            style={{ width: "64px", height: "64px", objectFit: "cover", border: "1px solid #e5e7eb" }}
          />
          <div>
            <h5 className="fw-semibold mb-1">{appt.professionals?.full_name}</h5>
            <div className="text-muted">{appt.professionals?.category}</div>
            <div className="text-muted">{[appt.professionals?.city, appt.professionals?.state].filter(Boolean).join(", ")}</div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="col-md-4 border-end">
          <div>
            <strong>From:</strong>{" "}
            {editingId === appt.id ? (
              <input type="datetime-local" className="form-control form-control-sm mb-2" value={editFrom} onChange={(e) => setEditFrom(e.target.value)} />
            ) : formatDateTime(appt.from_datetime)}
          </div>
          <div>
            <strong>To:</strong>{" "}
            {editingId === appt.id ? (
              <input type="datetime-local" className="form-control form-control-sm" value={editTo} onChange={(e) => setEditTo(e.target.value)} />
            ) : formatDateTime(appt.to_datetime)}
          </div>
          <div>
             {/* ✅ PAYMENT COLUMN */}
                     {appt.status === "accepted" && isUpcoming ? (
  <a
    onClick={() =>
      startRazorpayPayment({
        amount: 500,
        name: "Test User",
        email: "test@example.com",
        phone: "9876543210",
        onSuccess: () => alert("Payment success"),
        onFailure: () => alert("Payment failed"),
      })
    }
    className="text-decoration-underline c-pointer"
  >
    Pay Now
  </a>
) : (
  <span className="text-muted">NA</span>
)}

          </div>
        </div>

        {/* RIGHT */}
        <div className="d-flex col-md-3 justify-content-center align-items-center">
          <div className="text-center">
            <span className={`badge ${statusColor} px-3 py-2 mb-3`} style={{ borderRadius: "20px" }}>
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </span>
            {appt.status === "pending" && (
              <div className="d-flex flex-row gap-2">
                {editingId === appt.id ? (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => saveEdit(appt.id)}>Save</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(appt)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(appt)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => openCancelModal(appt)}>Cancel</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
