import { useState, useEffect } from "react";
import { getUserProfile } from "./getUserProfile";
import { supabase } from "./supabaseClient";
import Modal from "react-bootstrap/Modal";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import Button from "react-bootstrap/Button";

const Patient = () => {
  const [profile, setProfile] = useState(null);
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
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");

  // Booking state
  const [selectionStep, setSelectionStep] = useState("from");
  const [selectedDate, setSelectedDate] = useState({ from: null, to: null });
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState({});

  // Fetch India states
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India" }),
    })
      .then(res => res.json())
      .then(data => data?.data?.states && setStates(data.data.states))
      .catch(err => console.error(err));
  }, []);

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
      selectionStep === "to" &&
      selectedDate.from &&
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
    return slots.flatMap(slot => {
      const start = new Date(slot.from_datetime.replace(" ", "T"));
      const end = new Date(slot.to_datetime.replace(" ", "T"));
      const times = [];
      const current = new Date(start);
      while (current <= end) {
        times.push(`${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")}`);
        current.setMinutes(current.getMinutes() + 30);
      }
      return times;
    });
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!fromDateTime || !toDateTime) return alert("Please select from and to date & time");

    // Parse into Date objects
    const from = new Date(fromDateTime);
    const to = new Date(toDateTime);

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

  return (
    <div className="container">
      <h2 className="text-blue fw-bold">Welcome, {profile.full_name}</h2>

      {/* Search Form */}
      <div className="card shadow-lg rounded-4 d-flex mt-4 p-3">
        <h4 className="fw-bold mb-4 text-blue">Search</h4>
        {error && <p className="text-danger">{error}</p>}
        <div className="row text-start pb-1 search-form">
          <div className="col-md-2 mb-2">
            <label className="fw-bold mb-1">State</label>
            <select className="form-select" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
              <option value="">Select</option>
              {states.map(st => <option key={st.name} value={st.name}>{st.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="fw-bold mb-1">City</label>
            <input
              type="text"
              className="form-control"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Enter city"
            />
          </div>

          <div className="col-md-2">
            <label className="fw-bold mb-1">Skills</label>
            <input type="text" className="form-control" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Nursing" />
          </div>
          <div className="col-md-2">
            <label className="fw-bold mb-1">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select</option>
              <option value="Nurse">Nurse</option>
              <option value="Physiotherapist">Physiotherapist</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="fw-bold mb-1">From</label>
            <input type="datetime-local" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="fw-bold mb-1">To</label>
            <input type="datetime-local" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" onClick={searchProfessionals} disabled={searching}>{searching ? "Searching..." : "Search"}</button>
        </div>
      </div>

      {/* Results Table */}
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

      {/* Booking Modal */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment with {currentProfessional?.full_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(availableSlots).length === 0 ? <p>No available slots</p> :
            <>
              {selectionStep !== "done" && (
                <div className="row">
                  <div className="col-md-9">
                    <Calendar
                      value={selectionStep === "from" ? selectedDate.from : selectedDate.to}
                      onChange={(date) => {
                        setSelectedDate(prev => selectionStep === "from" ? { ...prev, from: date } : { ...prev, to: date });
                        selectionStep === "from" ? setFromDateTime("") : setToDateTime("");
                      }}
                      tileDisabled={tileDisabled}
                      tileClassName={tileClassName}
                    />
                  </div>
                  <div className="col-md-3">
                    {selectedDate[selectionStep] && (
                      <>
                        <label className="fw-bold">{selectionStep === "from" ? "From Time" : "To Time"}</label>
                        <select className="form-select" value="" onChange={(e) => {
                          const time = e.target.value;
                          const [h, m] = time.split(":");
                          const dt = new Date(selectedDate[selectionStep]);
                          dt.setHours(h, m, 0, 0);
                          const formatted = formatLocalDateTime(dt);
                          if (selectionStep === "from") { setFromDateTime(formatted); setSelectionStep("to"); }
                          else { setToDateTime(formatted); setSelectionStep("done"); }
                        }}>
                          <option value="">Select</option>
                          {getAvailableTimesForDate(selectedDate[selectionStep]).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              )}
              {fromDateTime && toDateTime && (
                <div className="mt-3">
                  <label className="fw-bold">Selected Appointment</label>
                  <input type="text" className="form-control mb-2" value={fromDateTime} readOnly />
                  <input type="text" className="form-control" value={toDateTime} readOnly />
                </div>
              )}
            </>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          {/* Show Confirm only if slots exist */}
          {Object.keys(availableSlots).length > 0 && (
            <Button variant="primary" onClick={handleConfirmBooking}>Confirm Booking</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Patient;
