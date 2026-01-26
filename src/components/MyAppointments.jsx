import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { startRazorpayPayment } from "../utils/razorpay";
const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFrom, setEditFrom] = useState("");
  const [editTo, setEditTo] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAppt, setCancelAppt] = useState(null);
  const openCancelModal = (appt) => {
    setCancelAppt(appt);
    setShowCancelModal(true);
  };
  const confirmCancel = async () => {
    if (!cancelAppt) return;

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", cancelAppt.id);

    if (error) {
      alert("Failed to cancel appointment");
      console.error(error);
      return;
    }

    // Remove from UI
    setAppointments((prev) =>
      prev.filter((a) => a.id !== cancelAppt.id)
    );

    setShowCancelModal(false);
    setCancelAppt(null);
  };

  const toInputDateTime = (value) => {
    if (!value) return "";

    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const startEdit = (appt) => {
    setEditingId(appt.id);

    // IMPORTANT: reset values every time
    setEditFrom(toInputDateTime(appt.from_datetime));
    setEditTo(toInputDateTime(appt.to_datetime));
  };

  const saveEdit = async (id) => {
    if (!editFrom || !editTo) {
      alert("Select both date & time");
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({
        from_datetime: editFrom.replace("T", " "),
        to_datetime: editTo.replace("T", " "),
      })
      .eq("id", id)
      .select(); // 👈 forces Supabase to return affected rows

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Update blocked by policy");
      return;
    }

    setEditingId(null);
    fetchAppointments(userId);
  };

  // -------------------- Fetch logged-in user --------------------
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      setUserId(user.id);
      fetchAppointments(user.id);
    };
    getUser();
  }, []);

  // -------------------- Fetch appointments for patient --------------------
  const fetchAppointments = async (patientId) => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
    id,
    from_datetime,
    to_datetime,
    status,
    professionals!inner(full_name)
  `)
      .eq("patient_id", patientId)
      .order("from_datetime", { ascending: true });


    if (error) {
      console.error("Error fetching appointments:", error.message);
      setAppointments([]);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  // -------------------- Helpers --------------------
  const formatDateTime = (datetime) => {
    if (!datetime) return "";
    const d = new Date(datetime);
    const date = d.toLocaleDateString("en-GB");
    const time = d.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  };



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
    await loadRazorpay();

    // Create Razorpay order
    const { data, error } = await supabase.functions.invoke(
      "create-razorpay-order",
      {
        body: { amount: 19900 }, // ₹199
      }
    );

    if (error) {
      alert("Order creation failed");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: "INR",
      order_id: data.id,
      name: "Healthcare App",
      description: "Consultation Fee",
      handler: async function (response) {
        // Verify payment
        const { data, error } = await supabase.functions.invoke(
          "verify-razorpay-payment",
          { body: response }
        );

        if (!error && data?.success) {
          alert("Payment successful");
        } else {
          alert("Payment verification failed");
        }
      },
      prefill: {
        name: "Patient Name",
        contact: "9999999999",
      },
      theme: { color: "#2563eb" },
    };

    new window.Razorpay(options).open();
  };

  if (loading) return <p>Loading your appointments...</p>;

  return (
    <div className="container mt-3">
      <h4 className="fw-semibold mb-4">My Appointments</h4>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="text-blue">Professional</th>
              <th className="text-blue">From Date & Time</th>
              <th className="text-blue">To Date & Time</th>
              <th className="text-blue">Status</th>
              <th className="text-blue">Payment</th>
              <th className="text-blue">Actions</th>
            </tr>
          </thead>
          <tbody className="fs-14">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No appointments found</td>
              </tr>
            ) : (
              appointments.map((appt) => {
                let statusClass = "";
                if (appt.status === "accepted") statusClass = "text-success fw-semibold";
                else if (appt.status === "pending") statusClass = "text-warning fw-semibold";
                else if (appt.status === "rejected") statusClass = "text-danger fw-semibold";

                return (
                  <tr key={appt.id}>
                    <td>{appt.professionals?.full_name || "Unknown"}</td>
                    <td>
                      {editingId === appt.id ? (
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          value={editFrom}
                          onChange={(e) => setEditFrom(e.target.value)}
                        />
                      ) : (
                        formatDateTime(appt.from_datetime)
                      )}
                    </td>
                    <td>
                      {editingId === appt.id ? (
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          value={editTo}
                          onChange={(e) => setEditTo(e.target.value)}
                        />
                      ) : (
                        formatDateTime(appt.to_datetime)
                      )}
                    </td>

                    <td className={statusClass}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </td>

                    {/* ✅ PAYMENT COLUMN */}
                    <td>
                      {appt.status === "accepted" ? (
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
                          className="text-decoration-underline c-pointer">
                          Pay Now
                        </a>
                      ) : (
                        <span className="text-muted">NA</span>
                      )}
                    </td>
                    <td>
                      {appt.status === "pending" && (
                        editingId === appt.id ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success mr-2"
                              onClick={() => saveEdit(appt.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <button
                              className="btn btn-sm btn-outline-primary mr-2"
                              onClick={() => startEdit(appt)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openCancelModal(appt)}
                            >
                              Cancel
                            </button>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
        {showCancelModal && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cancel Appointment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCancelModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    Are you sure you want to cancel this appointment?
                    <br />
                    <strong>This action cannot be undone.</strong>
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary fs-14"
                    onClick={() => setShowCancelModal(false)}
                  >
                    No
                  </button>
                  <button
                    className="btn btn-danger fs-14"
                    onClick={confirmCancel}
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyAppointments;
