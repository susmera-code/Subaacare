import { useState, useEffect } from "react";
import { getUserProfile } from "./getUserProfile";
import { supabase } from "./supabaseClient";
import Modal from "react-bootstrap/Modal";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
const Patient = () => {
  const [profile, setProfile] = useState(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState("");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProfessional, setCurrentProfessional] = useState(null);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");

  // Booking state
  const [selectionStep, setSelectionStep] = useState("from");
  const [selectedDate, setSelectedDate] = useState({ from: null, to: null });
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState({});

  // Load user profile
  useEffect(() => {
    getUserProfile()
      .then(res => setProfile(res.profile))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  // Utilities
  const toDateKey = (value) => {
    if (!value) return null;
    const date = typeof value === "string" ? new Date(value) : value;
    if (!(date instanceof Date) || isNaN(date)) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatLocalDateTime = (date) => {
    if (!date) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };
  const formatAMPM = (time) => {
    const [hour, minute] = time.split(":");

    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    if (h === 0) h = 12;

    return `${h}:${minute} ${ampm}`;
  };
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tileDate = new Date(date);
    tileDate.setHours(0, 0, 0, 0);

    const key = toDateKey(tileDate);

    // 🚫 past dates
    if (tileDate < today) return true;

    // 🚫 no availability
    if (!availableSlots[key]) return true;

    // 🚫 if selecting "to", block dates before selected "from"
    if (
      selectedDate.from &&
      selectionStep === "to" &&
      tileDate < new Date(toDateKey(selectedDate.from))
    ) {
      return true;
    }

    return false;
  };


  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const classes = [];
    if (selectedDate.from && toDateKey(date) === toDateKey(selectedDate.from)) classes.push("bg-success text-white rounded");
    if (selectedDate.to && toDateKey(date) === toDateKey(selectedDate.to)) classes.push("bg-danger text-white rounded");
    return classes.join(" ");
  };

  // Booking modal
  const handleOpenModal = (prof) => {
    const grouped = {};
    (prof.availability || []).forEach(slot => {
      const start = new Date(slot.from_datetime.replace(" ", "T"));
      const end = new Date(slot.to_datetime.replace(" ", "T"));
      let current = new Date(start); current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      while (current <= end) {
        const key = toDateKey(current);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(slot);
        current = addDays(current, 1);
      }
    });

    setCurrentProfessional(prof);
    setAvailableSlots(grouped);
    setSelectionStep("from");
    setSelectedDate({ from: null, to: null });
    setFromDateTime("");
    setToDateTime("");
    setModalOpen(true);
  };

  const getAvailableTimesForDate = (date) => {
    if (!date) return [];
    const key = toDateKey(date);
    const slots = availableSlots[key] || [];
    const uniqueTimes = new Set();

    slots.forEach(slot => {

      const start = new Date(slot.from_datetime.replace(" ", "T"));
      const end = new Date(slot.to_datetime.replace(" ", "T"));

      const current = new Date(start);

      while (current <= end) {

        const time =
          `${current.getHours().toString().padStart(2, "0")}:` +
          `${current.getMinutes().toString().padStart(2, "0")}`;

        uniqueTimes.add(time);

        current.setMinutes(current.getMinutes() + 30);

      }

    });

    return Array.from(uniqueTimes).sort();
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedDate.from || !selectedDate.to)
      return alert("Please select From and To dates");

    if (!fromDateTime || !toDateTime)
      return alert("Please select From and To times");
    // Parse into Date objects
    const buildDateTime = (date, time) => {

      const [h, m] = time.split(":");

      const dt = new Date(date);

      dt.setHours(h, m, 0, 0);

      return dt;

    };

    const from = buildDateTime(selectedDate.from, fromDateTime);

    const to = buildDateTime(selectedDate.to, toDateTime);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return alert("Invalid date/time selected");
    if (from >= to) return alert("From datetime must be before To datetime");

    const dayKey = toDateKey(from);
    const daySlots = availableSlots[dayKey] || [];
    const isWithinAvailability = daySlots.some(slot => {
      const slotFrom = new Date(slot.from_datetime.replace(" ", "T"));
      const slotTo = new Date(slot.to_datetime.replace(" ", "T"));
      return from >= slotFrom && to <= slotTo;
    });
    if (!isWithinAvailability) return alert("Selected time is outside availability");

    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const { data, error } = await supabase.from("appointments").insert({
        professional_id: currentProfessional.id,
        patient_id: user.id,
        from_datetime: formatLocalDateTime(from), // guaranteed YYYY-MM-DD HH:MM:SS
        to_datetime: formatLocalDateTime(to)
      });

      if (error) throw error;

      alert("Appointment booked successfully!");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to book appointment");
    }
  };


  // Search professionals
  const toPgTimestamp = (value) => value ? value.replace("T", " ") + ":00" : null;
  const searchProfessionals = async () => {
    setSearching(true); setError(""); setResults([]);
    try {
      const searchFrom = fromDate ? toPgTimestamp(fromDate) : null;
      const searchTo = toDate ? toPgTimestamp(toDate) : null;

      let profQuery = supabase.from("professionals").select("id, full_name, skills, state, city, category, email, profile_photo");
      if (selectedState) profQuery = profQuery.eq("state", selectedState);
      if (city) profQuery = profQuery.ilike("city", `%${city}%`);
      if (category) profQuery = profQuery.eq("category", category);
      if (skills) {
        const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
        if (skillsArray.length) profQuery = profQuery.contains("skills", skillsArray);
      }

      const { data: professionals, error: profError } = await profQuery;
      if (profError) throw profError;

      const final = [];
      for (const prof of professionals || []) {
        let availQuery = supabase.from("professional_availability").select("from_datetime, to_datetime").eq("professional_id", prof.id);
        if (searchFrom) availQuery = availQuery.gte("to_datetime", searchFrom);
        if (searchTo) availQuery = availQuery.lte("from_datetime", searchTo);
        availQuery = availQuery.order("from_datetime", { ascending: true });
        const { data: availability, error: availError } = await availQuery;
        if (availError) throw availError;
        final.push({ ...prof, availability: availability || [] });
      }
      setResults(final);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const getProfilePhotoUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(value);
    return data?.publicUrl || null;
  };
  const groupSlots = (slots) => {
    return {
      Morning: slots.filter(t => parseInt(t.split(":")[0]) < 12),
      Afternoon: slots.filter(t => {
        const h = parseInt(t.split(":")[0]);
        return h >= 12 && h < 17;
      }),
      Evening: slots.filter(t => parseInt(t.split(":")[0]) >= 17),
    };
  };
  return (
    <div className="container">
      <h2 className="text-blue fw-bold">Welcome, {profile.full_name}</h2>

      {/* Search Form */}
      <div className="mt-5">
        {error && <p className="text-danger">{error}</p>}
        <div className="row text-start pb-1 search-form g-0">

          {/* State */}
          <div className="col-12 col-md">
            <div className="form-floating position-relative">
              <i className="bi bi-geo-alt-fill position-absolute top-50 start-0 translate-middle-y ps-3 text-muted"
                style={{ pointerEvents: "none", zIndex: 2 }}
              ></i>

              <select
                className="form-select ps-5"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
              >
                <option value="">State</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
              </select>
              <label className="ps-4">State</label>
            </div>
          </div>

          {/* City */}
          <div className="col-12 col-md">
            <div className="form-floating position-relative">
              <i className="bi bi-geo-fill position-absolute top-50 start-0 translate-middle-y ps-3 text-muted"
                style={{ pointerEvents: "none", zIndex: 2 }}
              ></i>

              <input
                type="text"
                className="form-control ps-5"
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
              <label className="ps-4">City</label>
            </div>
          </div>

          {/* Skills */}
          <div className="col-12 col-md">
            <div className="form-floating position-relative">
              <i className="bi-heart-pulse-fill position-absolute top-50 start-0 translate-middle-y ps-3 text-muted"
                style={{ pointerEvents: "none", zIndex: 2 }}
              ></i>

              <input
                type="text"
                className="form-control ps-5"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="e.g. Nursing"
              />
              <label className="ps-4">Skills</label>
            </div>
          </div>

          {/* Category */}
          <div className="col-12 col-md">
            <div className="form-floating position-relative">
              <i className="bi bi-activity position-absolute fs-18 top-50 start-0 translate-middle-y ps-3 text-muted"
                style={{ pointerEvents: "none", zIndex: 2 }}
              ></i>

              <select
                className="form-select ps-5"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Nurse">Nurse</option>
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Others">Others</option>
              </select>
              <label className="ps-4">Category</label>
            </div>
          </div>

        </div>

        {showMoreFilters && (
          <div className="row mt-4 g-0">

            <div className="col-12 col-md">
              <div className="form-floating mb-3 position-relative">
                <i className="bi bi-calendar3 fs-18 position-absolute top-50 start-0 translate-middle-y ps-3 text-muted"
                  style={{ pointerEvents: "none" }}
                ></i>
                <input type="datetime-local" className="form-control ps-5" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                <label className="pl-3">From</label>
              </div></div>
            <div className="col-12 col-md">
              <div className="form-floating mb-3 position-relative">
                <i className="bi bi-calendar3 fs-18 position-absolute top-50 start-0 translate-middle-y ps-3 text-muted"
                  style={{ pointerEvents: "none" }}
                ></i>
                <input type="datetime-local" className="form-control ps-5" value={toDate} onChange={e => setToDate(e.target.value)} />
                <label className="pl-3">To</label>
              </div></div>
          </div>
        )}
        <div className="d-flex align-items-center mt-4 gap-3 mb-3 float-end">
          <button
            className="btn btn-primary fs-15"
            onClick={() => setShowMoreFilters(prev => !prev)}
          >
            <i className="bi bi-plus-circle me-1 fs-14"></i>
            {showMoreFilters ? "Hide Filters" : "More Filters"}
          </button>

          <button
            className="btn btn-primary fs-15"
            onClick={searchProfessionals}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

      </div>

      {/* Results Table */}

      <div class="table-responsive w-100">
        <table className="table table-striped table-bordered align-middle mt-4">
          <thead className="table-primary">
            <tr>
              <th className="text-blue">#</th>
              <th className="text-blue">Photo</th>
              <th className="text-blue">Name</th>
              <th className="text-blue">Skills</th>
              <th className="text-blue">State</th>
              <th className="text-blue">City</th>
              <th className="text-blue">Role</th>
              <th className="text-blue">Book</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? <tr><td colSpan="8" className="text-center">No results found</td></tr> :
              results.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td className="text-center">{p.profile_photo ? <img src={getProfilePhotoUrl(p.profile_photo)} alt="Profile" width="50" height="50" style={{ borderRadius: "50%", objectFit: "cover" }} /> : <span className="text-muted">No Photo</span>}</td>
                  <td>{p.full_name}</td>
                  <td>
                    {Array.isArray(p.skills) && p.skills.length > 0
                      ? p.skills.join(", ")
                      : <span className="text-muted">No skills</span>
                    }
                  </td>

                  <td>{p.state}</td>
                  <td>{p.city}</td>
                  <td>{p.category}</td>
                  <td><button className="btn btn-sm btn-success" onClick={() => handleOpenModal(p)}>Book Appointment</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {/* Booking Modal */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-blue">Book Appointment with {currentProfessional?.full_name}</Modal.Title>
        </Modal.Header>
        {/* Professional Info Header */}
        <div className="d-flex align-items-center gap-3 p-3 border-bottom w-100 bg-light">
          {/* Photo */}
          <div>
            {currentProfessional?.profile_photo ? (
              <img
                src={getProfilePhotoUrl(
                  currentProfessional.profile_photo
                )}
                alt="Professional"
                width="70"
                height="70"
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #dee2e6"
                }}
              />
            ) : (
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "#e9ecef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "#6c757d"
                }}
              >
                <i className="bi bi-person"></i>
              </div>
            )}
          </div>

          {/* Name + Location */}
          <div>
            <div className="fw-bold fs-5">
              {currentProfessional?.full_name}
            </div>

            <div className="text-muted">
              <i className="bi bi-geo-alt me-1"></i>
              {currentProfessional?.city},{" "}
              {currentProfessional?.state}
            </div>

            <div className="text-muted small">
              {currentProfessional?.category}
            </div>

          </div>

        </div>
        <Modal.Body>
          {Object.keys(availableSlots).length === 0 ? <p>No available slots</p> :
            <>
              {selectionStep !== "done" && (
                <div className="d-flex flex-column align-items-center">

                  {/* Calendar */}

                  <div className="mb-4 calendar-wrapper">
                    <label className="fw-bold mb-2">
                      Select Date
                    </label>
                      {selectedDate.from && !selectedDate.to && (
                    <div className="alert fs-14 alert-info py-2">
                      Please select <strong>To Date</strong> to continue
                    </div>
                  )}
                    <Calendar
                      value={selectionStep === "from" ? selectedDate.from : selectedDate.to}
                      onChange={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        if (date < today) {
                          alert("Past dates are not allowed");
                          return;
                        }

                        // Select FROM
                        if (selectionStep === "from") {

                          setSelectedDate({
                            from: date,
                            to: null
                          });

                          setFromDateTime("");
                          setToDateTime("");
                          setSelectionStep("to");

                          return;
                        }

                        // Select TO
                        if (selectionStep === "to") {

                          if (date < selectedDate.from) {
                            alert("To date cannot be earlier than From date");
                            return;
                          }

                          setSelectedDate(prev => ({
                            ...prev,
                            to: date
                          }));

                          setFromDateTime("");
                          setToDateTime("");

                          return;
                        }
                      }}
                      tileDisabled={tileDisabled}
                      tileClassName={tileClassName}
                    />
                  </div>
                
                  <div >
                    {selectedDate.from && selectedDate.to && (
                      <div className="w-100 d-flex gap-5">
                        {/* FROM TIME */}
                        <div className="mb-3">
                          <label className="form-label fs-15">From Time</label>
                          <select
                            className="form-select fs-14"
                            value={fromDateTime}
                            onChange={(e) => {
                              const time = e.target.value;
                              setFromDateTime(time);
                            }}
                          >
                            <option value="" className="text-muted placeholder-custom">
                              Select From Time
                            </option>

                            {getAvailableTimesForDate(selectedDate.from)
                              .map(t => (

                                <option key={t} value={t}>

                                  {formatAMPM(t)}

                                </option>
                              ))}
                          </select>
                        </div>
                        {/* TO TIME */}
                        <div>
                          <label className="form-label fs-15">To Time</label>
                          <select
                            className="form-select fs-14"
                            value={toDateTime}
                            onChange={(e) => {
  const time = e.target.value;

  // ❌ If FROM not selected → show error
  if (!fromDateTime) {
    alert("Please select From Time first");
    return;
  }

  // ❌ Validate order
  if (time <= fromDateTime) {
    alert("To time must be after From time");
    return;
  }

  // ✅ Valid 
  setToDateTime(time);
  setSelectionStep("done");
}}>
                            <option value="">
                              Select To Time
                            </option>

                            {getAvailableTimesForDate(selectedDate.to)
                              .map(t => (
                                <option key={t} value={t}>
                                  {formatAMPM(t)}
                                </option>
                              ))}

                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {fromDateTime && toDateTime && (
                <div className="p-3 rounded" style={{ background: "#f1f5f9" }}>

                  <h5 className="fw-bold mb-3">Appointment Details</h5>

                  {/* Date */}
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar3 me-2 text-primary"></i>
                    <div>
                      <div>
                        {selectedDate.from?.toDateString()}
                        {selectedDate.to &&
                          selectedDate.to !== selectedDate.from &&
                          ` → ${selectedDate.to.toDateString()}`}
                      </div>
                      <small className="text-muted">Appointment date</small>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-clock me-2 text-primary"></i>
                    <div>
                      <div>
                        {formatAMPM(fromDateTime)} → {formatAMPM(toDateTime)}
                      </div>
                      <small className="text-muted">Appointment time</small>
                    </div>
                  </div>

                  {/* Fee (optional static or dynamic) */}
                  <div className="d-flex align-items-center mt-3">
                    <i className="bi bi-currency-rupee me-2 text-primary"></i>
                    <div>
                      <div className="fw-bold">₹500</div>
                      <small className="text-muted">Consultation fee</small>
                    </div>
                  </div>

                </div>
              )}
            </>}
        </Modal.Body>
        <Modal.Footer>
          {selectionStep === "done" && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSelectionStep("to"); // go back but KEEP data
              }}
            >Back
            </button>
          )}
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          {/* Show Confirm only if slots exist */}
          {Object.keys(availableSlots).length > 0 && (
            <Button
              variant="primary"
              onClick={handleConfirmBooking}
              disabled={
                !selectedDate.from ||
                !selectedDate.to ||
                !fromDateTime ||
                !toDateTime
              }
            >Confirm Booking</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Patient;
