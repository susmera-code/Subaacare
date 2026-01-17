import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { startRazorpayPayment } from "../utils/razorpay";
const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

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
              <th className="text-blue">Payment</th> {/* ✅ NEW */}
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
                    <td>{formatDateTime(appt.from_datetime)}</td>
                    <td>{formatDateTime(appt.to_datetime)}</td>

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
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default MyAppointments;
