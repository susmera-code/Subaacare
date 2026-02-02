import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeView, setActiveView] = useState("appointments");
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");


  // -------------------- Helpers --------------------
  const toInputFormat = (value) => value ? value.replace(" ", "T").slice(0, 16) : "";
  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value.replace(" ", "T"));
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
const formatForSupabase = (datetime) => {
  if (!datetime) return null;
  const d = new Date(datetime);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = "00"; // add seconds
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

  // -------------------- Auth & Approval --------------------
  useEffect(() => {
    checkApproval();
  }, []);

  const checkApproval = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("professionals")
      .select("status")
      .eq("id", user.id)
      .single();

    if (error || !data || data.status !== "approved") {
      navigate("/professional");
      return;
    }

    setUserId(user.id);
    fetchAvailability(user.id);
    fetchAppointments(user.id); // no need to pass null
    setLoading(false);
  };

  // -------------------- Fetch Availability --------------------
  const fetchAvailability = async (id) => {
    const { data } = await supabase
      .from("professional_availability")
      .select("*")
      .eq("professional_id", id)
      
    setAvailability(data || []);
  };

  // -------------------- Fetch Appointments --------------------
  const fetchAppointments = async (profId) => {
    if (!profId) return;

    const { data, error } = await supabase
      .from("appointments")
      .select(`
      id,
      from_datetime,
      to_datetime,
      status,
      patients!inner(full_name)
    `)
      .eq("professional_id", profId)
      .in("status", ["pending", "accepted"]) // <- only fetch these
      .order("from_datetime", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error.message);
      setAppointments([]);
    } else {
      setAppointments(data || []);
    }
  };


  const handleDeleteAppointment = async (id) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "rejected" })
      .eq("id", id);

    if (!error) {
      setAppointments((prev) => prev.filter(appt => appt.id !== id));
    }
  };


  const handleAcceptAppointment = async (id) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "accepted" })
      .eq("id", id);

    if (!error) {
      setAppointments((prev) =>
        prev.map(appt => appt.id === id ? { ...appt, status: "accepted" } : appt)
      );
    }
  };



  // -------------------- Availability Management --------------------
  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setFromDateTime(toInputFormat(slot.from_datetime));
    setToDateTime(toInputFormat(slot.to_datetime));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fromDateTime || !toDateTime) {
      setError("Both From and To fields are required");
      return;
    }

    if (new Date(fromDateTime) >= new Date(toDateTime)) {
      setError("End time must be after start time");
      return;
    }
const payload = {
  from_datetime: formatForSupabase(fromDateTime),
  to_datetime: formatForSupabase(toDateTime),
};


    let response;

    if (editingId) {
      response = await supabase
        .from("professional_availability")
        .update(payload)
        .eq("id", editingId)
        .eq("professional_id", userId);
    } else {
      response = await supabase
        .from("professional_availability")
        .insert({
          professional_id: userId,
          ...payload,
        });
    }

    if (response.error) {
      setError(response.error.message);
      return;
    }

    // ✅ SUCCESS ALERT
    alert(editingId
      ? "Availability updated successfully!"
      : "Availability added successfully!"
    );

    resetModal();
    fetchAvailability(userId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this availability?")) return;
    await supabase
      .from("professional_availability")
      .delete()
      .eq("id", id)
      .eq("professional_id", userId);
    fetchAvailability(userId);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFromDateTime("");
    setToDateTime("");
    setError("");
  };
// -------------------- Appointment Sorting --------------------
const now = new Date();

const upcomingAppointments = appointments
  .filter(appt => new Date(appt.from_datetime) >= now)
  .sort((a, b) => new Date(a.from_datetime) - new Date(b.from_datetime));

const pastAppointments = appointments
  .filter(appt => new Date(appt.from_datetime) < now)
  .sort((a, b) => new Date(b.from_datetime) - new Date(a.from_datetime));
const upcomingAvailability = availability
  .filter(slot => new Date(slot.from_datetime) >= now)
  .sort((a, b) => new Date(a.from_datetime) - new Date(b.from_datetime));

const pastAvailability = availability
  .filter(slot => new Date(slot.from_datetime) < now)
  .sort((a, b) => new Date(b.from_datetime) - new Date(a.from_datetime));

  if (loading) return <p>Checking approval status...</p>;

  // -------------------- JSX --------------------
  return (
    <div className="container">

      <div className="mb-3 text-end">
        <button
          className="btn btn-outline-primary me-2 fs-12 fw-semibold"
          onClick={() => setShowModal(true)}
        >Add Availability</button>

        <button
          className="btn btn-outline-secondary fs-12 fw-semibold"
          onClick={() => { setActiveView("availability"); setShowModal(false); }}
        >Edit Availability</button>
      </div>

      {/* -------------------- Modal -------------------- */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold">{editingId ? "Edit Availability" : "Add Availability"}</h6>
                <button className="btn-close" onClick={resetModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && <p className="text-danger">{error}</p>}

                  <div className="mb-3 text-start fs-14">
                    <label>From</label>
                    <input type="datetime-local" className="form-control fs-14" value={fromDateTime} onChange={(e) => setFromDateTime(e.target.value)} />
                  </div>

                  <div className="mb-3 text-start fs-14">
                    <label>To</label>
                    <input type="datetime-local" className="form-control fs-14" value={toDateTime} onChange={(e) => setToDateTime(e.target.value)} />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary fs-14" onClick={resetModal}>Cancel</button>
                  <button type="submit" className="btn btn-success fs-14">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- Appointments Table -------------------- */}
      {activeView === "appointments" && (
        <div className="accordion mt-3" id="appointmentsAccordion">

          {/* 🔵 UPCOMING APPOINTMENTS */}
          <div className="accordion-item mb-3">
            <h2 className="accordion-header" id="upcomingHeading">
              <button
                className="accordion-button fw-semibold text-blue"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#upcomingCollapse"
                aria-expanded="true"
              >
                Upcoming Appointments ({upcomingAppointments.length})
              </button>
            </h2>

            <div
              id="upcomingCollapse"
              className="accordion-collapse collapse show"
              data-bs-parent="#appointmentsAccordion"
            >
              <div className="accordion-body table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Actions / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">No upcoming appointments</td>
                      </tr>
                    ) : (
                      upcomingAppointments.map((appt) => {
                        const fromDT = new Date(appt.from_datetime);
                        const toDT = new Date(appt.to_datetime);

                        return (
                          <tr key={appt.id}>
                            <td>{appt.patients?.full_name || "Unknown"}</td>
                            <td>{fromDT.toLocaleDateString("en-GB")} {fromDT.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" })}</td>
                            <td>{toDT.toLocaleDateString("en-GB")} {toDT.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" })}</td>
                            <td>
                              {appt.status === "pending" ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-2 fs-12"
                                    onClick={() => handleAcceptAppointment(appt.id)}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger fs-12"
                                    onClick={() => handleDeleteAppointment(appt.id)}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-success fw-semibold">Accepted</span>
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
          </div>

          {/* ⚫ PAST APPOINTMENTS */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="pastHeading">
              <button
                className="accordion-button collapsed fw-semibold text-blue"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#pastCollapse"
              >
                Previous Appointments ({pastAppointments.length})
              </button>
            </h2>

            <div
              id="pastCollapse"
              className="accordion-collapse collapse"
              data-bs-parent="#appointmentsAccordion"
            >
              <div className="accordion-body table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">No past appointments</td>
                      </tr>
                    ) : (
                      pastAppointments.map((appt) => {
                        const fromDT = new Date(appt.from_datetime);
                        const toDT = new Date(appt.to_datetime);

                        return (
                          <tr key={appt.id}>
                            <td>{appt.patients?.full_name || "Unknown"}</td>
                            <td>{fromDT.toLocaleDateString("en-GB")} {fromDT.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" })}</td>
                            <td>{toDT.toLocaleDateString("en-GB")} {toDT.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" })}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- Availability Table -------------------- */}
     {activeView === "availability" && (
  <div className="mt-3">

    {/* Upcoming / Current Availability */}
    <h4 className="fw-semibold mb-2 text-blue">Upcoming Availability</h4>
    <div className="table-responsive mb-4">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {upcomingAvailability.length === 0 ? (
            <tr><td colSpan="3" className="text-center">No upcoming availability</td></tr>
          ) : (
            upcomingAvailability.map(slot => (
              <tr key={slot.id}>
                <td>{formatDateTime(slot.from_datetime)}</td>
                <td>{formatDateTime(slot.to_datetime)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(slot)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(slot.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Past Availability */}
    <h4 className="fw-semibold mb-2 text-blue">Past Availability</h4>
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pastAvailability.length === 0 ? (
            <tr><td colSpan="3" className="text-center">No past availability</td></tr>
          ) : (
            pastAvailability.map(slot => (
              <tr key={slot.id}>
                <td>{formatDateTime(slot.from_datetime)}</td>
                <td>{formatDateTime(slot.to_datetime)}</td>
                <td><span className="badge bg-secondary">Expired</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

  </div>
)}


    </div>
  );
};

export default ProfessionalDashboard;
