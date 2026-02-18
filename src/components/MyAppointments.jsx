import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { startRazorpayPayment } from "../utils/razorpay";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  {/* Cancelled logic */ }
  const confirmCancel = async () => {
    if (!cancelAppt) return;

    // STRICT paid check
    const isPaid = cancelAppt.payment_status === "paid";

    const updateData = isPaid
      ? {
        status: "cancelled",
        payment_status: "refund initiated"
      }
      : {
        status: "cancelled",
        payment_status: "cancelled"   // unpaid cancellation
      };

    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", cancelAppt.id);

    if (error) {
      alert("Failed to cancel appointment");
      return;
    }

    fetchAppointments(userId);

    setShowCancelModal(false);
    setCancelAppt(null);

    alert(isPaid
      ? "Appointment cancelled. Refund initiated."
      : "Appointment cancelled."
    );
  };

  const toInputDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
        payment_status,
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
            <div className="accordion-body d-flex flex-column">
              {upcoming.length === 0 && <><p className="text-muted">No upcoming appointments</p>
                <a
                  href="/patient"
                  className="fw-semibold text-primary text-decoration-underline"
                  style={{ fontSize: "15px" }}
                >
                  + Create New Appointment
                </a>
              </>}
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
                  formatDateTime={formatDateTime}
                  fetchAppointments={() => fetchAppointments(userId)}
                  setEditingId={setEditingId}
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
const AppointmentCard = ({ appt, editingId, startEdit, saveEdit, openCancelModal, editFrom, setEditFrom, editTo, setEditTo, fetchAppointments, setEditingId }) => {
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
            <h5 className="fw-semibold mb-1 text-blue">{appt.professionals?.full_name}</h5>
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
            {isUpcoming && (
              <>
                {/* Accepted appointments */}

                {appt.status === "accepted" && appt.payment_status === "paid" && (
                  <span className="badge bg-success">Paid</span>
                )}
                {/* 💳 PAY NOW */}
                {appt.status === "accepted" && appt.payment_status !== "paid" && (
                  <a
                    onClick={() =>
                      startRazorpayPayment({
                        amount: 500,
                        name: "Test User",
                        email: "test@example.com",
                        phone: "9876543210",
                        onSuccess: async (response) => {
                          const { error } = await supabase
                            .from("appointments")
                            .update({
                              payment_status: "paid",
                              razorpay_payment_id: response.razorpay_payment_id
                            })
                            .eq("id", appt.id);

                          if (error) {
                            alert("Payment done but status update failed: " + error.message);
                            return;
                          }

                          fetchAppointments();
                          alert("Payment successful");
                        },
                        onFailure: () => alert("Payment failed"),
                      })
                    }
                    className="text-decoration-underline c-pointer"
                  >
                    Pay Now
                  </a>
                )}


                {/* Pending only */}
                {appt.status === "pending" && (
                  <span className="text-warning">Waiting for approval</span>
                )}

                {/* Rejected → show nothing */}
                {appt.status === "rejected" && (
                  <span className="text-muted">Not Applicable</span>
                )}

                {appt.status === "cancelled" && (
                  appt.payment_status === "refund initiated" ? (
                    <span className="badge bg-info text-white">Refund Initiated</span>
                  ) : (
                    <span className="text-muted">Cancelled</span>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="d-flex col-md-3 justify-content-center align-items-center">
          <div className="text-center">
            <span className={`badge ${statusColor} px-3 py-2 mb-3`}>
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </span>
            {isUpcoming && (
              <div className="d-flex flex-row gap-2">

                {/* 🟢 EDIT MODE */}
                {editingId === appt.id ? (
                  <>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => saveEdit(appt.id)}
                    >
                      Save
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* ✏️ EDIT: Pending OR Accepted but NOT Paid */}
                    {(appt.status === "pending" ||
                      (appt.status === "accepted" && appt.payment_status !== "paid")) && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(appt)}
                        >
                          Edit
                        </button>
                      )}

                    {/* ❌ CANCEL: Pending OR Accepted */}
                    {(appt.status === "pending" || appt.status === "accepted") && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => openCancelModal(appt)}
                      >
                        Cancel Appointment
                      </button>
                    )}
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
