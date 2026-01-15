import { useState, useEffect } from "react";
import { getUserProfile } from "./getUserProfile";
import { supabase } from "./supabaseClient";

const Patient = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState({}); // { professionalId: selectedIndex }

  // Set the selected slot
  const setSelectedSlot = (professionalId, slotIndex) => {
    setSelected(prev => ({ ...prev, [professionalId]: slotIndex }));
  };

  // Convert datetime-local to PostgreSQL timestamp
  const toPgTimestamp = (value) => {
    if (!value) return null;
    return value.replace("T", " ") + ":00";
  };

  // Search professionals based on filters
  const searchProfessionals = async () => {
    setSearching(true);
    setError("");
    setResults([]);

    try {
      const searchFrom = fromDate ? toPgTimestamp(fromDate) : null;
      const searchTo = toDate ? toPgTimestamp(toDate) : null;

      let profQuery = supabase.from("professionals").select("id, state, category, email");
      if (location) profQuery = profQuery.ilike("state", `%${location}%`);
      if (category) profQuery = profQuery.eq("category", category);

      const { data: professionals, error: profError } = await profQuery;
      if (profError) throw profError;
      if (!professionals || professionals.length === 0) {
        setResults([]);
        return;
      }

      const final = [];

      for (const prof of professionals) {
        let availQuery = supabase
          .from("professional_availability")
          .select("from_datetime, to_datetime")
          .eq("professional_id", prof.id);

        if (searchFrom) availQuery = availQuery.gte("to_datetime", searchFrom);
        if (searchTo) availQuery = availQuery.lte("from_datetime", searchTo);

        availQuery = availQuery.order("from_datetime", { ascending: true });

        const { data: availability, error: availError } = await availQuery;
        if (availError) throw availError;

        final.push({
          ...prof,
          availability: availability || [],
        });
      }

      setResults(final);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        setProfile(res.profile);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setLoading(false);
      });
  }, []);

  // Book an appointment (React only inserts to DB)
const handleBook = async (professionalId) => {
  const slotIndex = selected[professionalId];
  if (slotIndex === undefined) return alert("Select a slot");

  const prof = results.find(p => p.id === professionalId);
  const slot = prof.availability[slotIndex];

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Insert appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        professional_id: professionalId,
        patient_id: user.id,
        from_datetime: slot.from_datetime,
        to_datetime: slot.to_datetime,
      })
      .select()
      .single();
    if (error) throw error;

    // ✅ Call public Edge Function to send email
    await fetch('https://yzrpbocdsgmdagmqthsy.functions.supabase.co/send-appointment-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment })
    });

    alert("Appointment booked & email sent");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};



  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Welcome, {profile.full_name}</h2>

      {/* Search Card */}
      <div className="card shadow-lg rounded-4 d-flex mt-4 p-3">
        <h4 className="fw-bold mb-4">Search</h4>
        {error && <p className="text-danger">{error}</p>}

        <div className="row text-start pb-1">
          <div className="col-md-3">
            <label className="fw-bold mb-1">Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="fw-bold mb-1">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Nurse">Nurse</option>
              <option value="Physiotherapist">Physiotherapist</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="fw-bold mb-1">From</label>
            <input
              type="datetime-local"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="fw-bold mb-1">To</label>
            <input
              type="datetime-local"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-primary"
            onClick={searchProfessionals}
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results Table */}
      <table className="table table-striped table-bordered align-middle mt-4">
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Location</th>
            <th>Role</th>
            <th>Availability</th>
            <th>Book</th>
          </tr>
        </thead>

        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No results found</td>
            </tr>
          ) : (
            results.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.state}</td>
                <td>{p.category}</td>
                <td>
                  {p.availability.length === 0 ? (
                    <span>No slots</span>
                  ) : (
                    <div className="d-flex flex-column gap-1">
                      {p.availability.map((a, idx) => (
                        <label key={idx} className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            name={`slot-${p.id}`}
                            value={idx}
                            onChange={() => setSelectedSlot(p.id, idx)}
                            checked={selected[p.id] === idx}
                          />
                          <span>
                            {new Date(a.from_datetime).toLocaleString("en-GB", { hour12: false })} —{" "}
                            {new Date(a.to_datetime).toLocaleString("en-GB", { hour12: false })}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-success fs-12"
                    onClick={() => handleBook(p.id)}
                    disabled={selected[p.id] === undefined}
                  >
                    Book Appointment
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Patient;
