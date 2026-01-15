import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

const PatientProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // -------------------- Fetch Profile --------------------
  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, created_at")
      .eq("id", user.id)
      .single();

    if (error) {
      setError("Unable to load profile");
    } else {
      setPatient(data);
      setFullName(data.full_name);
      setPhone(data.phone);
    }

    setLoading(false);
  };

  // -------------------- Save Profile --------------------
  const handleSave = async () => {
    if (!fullName || !phone) {
      setError("Name and phone are required");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("patients")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", patient.id);

    if (error) {
      setError(error.message);
    } else {
      setPatient({
        ...patient,
        full_name: fullName,
        phone: phone,
      });
      setEditMode(false);
    }

    setSaving(false);
  };

  // -------------------- UI States --------------------
  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h4 className="fw-semibold mb-4">My Profile</h4>

      <div className="card shadow-sm">
        <div className="card-body">

          {/* Name */}
          <div className="row mb-3 align-items-center">
            <div className="col-md-3 fw-semibold text-blue">Name:</div>
            <div className="col-md-4 text-start">
              {editMode ? (
                <input
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              ) : (
                <span className="text-primary">{patient.full_name}</span>
              )}
            </div>
          </div>

          {/* Email (Read Only) */}
          <div className="row mb-3 align-items-center">
            <div className="col-md-3 fw-semibold text-blue">Email:</div>
            <div className="col-md-4 text-start">
              <span className="text-primary">{patient.email}</span>
            </div>
          </div>

          {/* Phone */}
          <div className="row mb-3 align-items-center">
            <div className="col-md-3 fw-semibold text-blue">Phone:</div>
            <div className="col-md-4 text-start">
              {editMode ? (
                <input
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              ) : (
                <span className="text-primary">{patient.phone}</span>
              )}
            </div>
          </div>

          {/* Joined */}
          <div className="row mb-3 align-items-center">
            <div className="col-md-3 fw-semibold text-blue">Joined On:</div>
            <div className="col-md-4 text-start">
              <span className="text-primary">
                {patient.created_at
                  ? new Date(patient.created_at).toLocaleDateString("en-GB")
                  : "-"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="text-end mt-4">
            {editMode ? (
              <>
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setEditMode(false);
                    setFullName(patient.full_name);
                    setPhone(patient.phone);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
