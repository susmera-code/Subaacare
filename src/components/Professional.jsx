import { useState, useEffect, useRef } from "react";
import { getUserProfile } from "./getUserProfile";
import { submitProfessionalProfile } from "./professionalFormValidation";
import ProfessionalStatus from "./ProfessionalStatus";
import { supabase } from "./supabaseClient";

const ProfessionalsRegister = () => {
  const [profile, setProfile] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [proTermsAccepted, setProTermsAccepted] = useState(false); // professional

  const identityRef = useRef(null);

  const [formData, setFormData] = useState({
    aadhar: "",
    aadharFile: null,
    pan: "",
    panFile: null,
    addressProofType: "",
    addressProofFile: null,
    qualification: "",
    customQualification: "",
    institution: "",
    experience: "",
    skills: [],
  });
  const [formError, setFormError] = useState("");
  const [mode, setMode] = useState("form");
  const [editBasic, setEditBasic] = useState(false); // new state for name/phone edit
  const [basicData, setBasicData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setBasicData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    if (!profile.profile_submitted || profile.status === "rejected") {
      setMode("form");
    } else {
      setMode("view");
    }
  }, [profile]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await getUserProfile();
      setProfile(res.profile);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const prefillForm = (profile) => {
    setFormData((prev) => ({
      ...prev,
      aadhar: profile.aadhar || "",
      pan: profile.pan || "",
      addressProofType: profile.address_proof_type || "",
      qualification: profile.qualification || "",
      customQualification: profile.custom_qualification || "",
      institution: profile.institution || "",
      experience: profile.experience || "",
      skills: profile.skills || "",
    }));
  };

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        setProfile(res.profile);
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error(err.message);
        setLoadingProfile(false);
      });
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ✅ validation
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setFormError("Only JPG, JPEG, PNG files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Image size must be under 2MB");
      return;
    }
    setFormError("");
    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const uploadProfilePhoto = async (file, userId) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/profile.${fileExt}`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };
  if (loadingProfile) return <p>Loading...</p>;

  return (
    <div className="container">
      <div >
        {formError && <div className="text-danger mb-3">{formError}</div>}
        <div className="text-start fs-15">
          {/* My Profile */}
          <div id="profile">
            <h2 className="text-center fw-semibold" style={{ color: "#063b84" }}>My Profile</h2>
             {/* PROFILE STATUS CARD */}
            {!profile?.profile_submitted || profile.status === "rejected" && (
              <div className="card mb-4 p-3 shadow-sm" style={{ borderRadius: "12px", background: "#fff3cdc9", borderColor: "#ece4b2" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <ProfessionalStatus />
                    <div className="fs-16 text-secondary">
                      Complete your profile to get listed and receive bookings
                    </div>
                  </div>
                  {/* Show button only if profile not submitted/ rejected*/}

                  <button className="btn btn-primary fs-14" onClick={() => {
                    setMode("form"); // open the form
                    identityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}>
                    Complete Profile
                  </button>
                </div>
              </div>
            )}
            <div className="card shadow-sm border-0 mb-4 p-0" style={{ borderRadius: "12px" }}>
              {/* CARD HEADER */}
              <div className="card-header bg-blue d-flex justify-content-between align-items-center border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-circle text-primary fs-20"></i>
                  <h5 className="mb-0 fw-semibold text-blue">Basic Information</h5>
                </div>

                {mode === "view" && (
                  <div className="text-end">
                    {editBasic ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={async () => {
                            try {
                              let photoUrl = profile.profile_photo;

                              // upload photo only if changed
                              if (profilePhoto) {
                                photoUrl = await uploadProfilePhoto(profilePhoto, profile.id);
                              }

                              const { error } = await supabase
                                .from("professionals")
                                .update({
                                  full_name: basicData.full_name,
                                  phone: basicData.phone,
                                  profile_photo: photoUrl,
                                })
                                .eq("id", profile.id);

                              if (error) throw error;

                              setProfile({
                                ...profile,
                                full_name: basicData.full_name,
                                phone: basicData.phone,
                                profile_photo: photoUrl,
                              });

                              setEditBasic(false);
                            } catch (err) {
                              setFormError(err.message);
                            }
                          }}

                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm ms-2"
                          onClick={() => {
                            // cancel edit
                            setBasicData({
                              full_name: profile.full_name,
                              phone: profile.phone,
                            });
                            setEditBasic(false);
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline-primary fs-14"
                        onClick={() => setEditBasic(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CARD BODY */}
              <div className="card-body">
                <div className="row ">
                  {/* LEFT: PROFILE IMAGE */}
                  <div className="col-md-2 text-center">
                    <div
                      className="mb-2 position-relative d-flex justify-content-center align-items-center"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "10px",
                        border: "1px dashed rgb(69 108 167)",
                        background: "#f8fbff",
                        overflow: "hidden",
                      }}
                    >
                      {/* Image (only render if exists) */}
                      {(photoPreview || profile?.profile_photo) && (
                        <img
                          src={photoPreview || profile.profile_photo}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      {/* + Button */}
                      {!photoPreview && !profile?.profile_photo && (
                        <div
                          className="position-absolute d-flex justify-content-center align-items-center"
                          style={{
                            pointerEvents: "none", // click passes to overlay
                            cursor: "pointer",
                            fontSize: "30px",
                            color: "#0849a3"
                          }}
                        >
                          +
                          <input
                            type="file"
                            hidden
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handlePhotoChange}
                          />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      className="fs-10"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handlePhotoChange}
                    />
                  </div>

                  {/* RIGHT: DETAILS */}
                  <div className="col-md-10">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      {/* Left: Name */}
                      <h4 className="fw-semibold text-blue mb-0">
                        {editBasic ? (
                          <input
                            className="form-control"
                            type="text"
                            value={basicData.full_name}
                            onChange={(e) =>
                              setBasicData({ ...basicData, full_name: e.target.value })
                            }
                          />
                        ) : (
                          profile.full_name
                        )}
                      </h4>

                      {/* Right: Status */}
                      {profile.status == "approved" && (
                        <div className="d-flex align-items-center">
                          <ProfessionalStatus status={profile.status} />
                        </div>
                      )}
                    </div>

                    <div className="fs-16 text-blue">
                      {/* PHONE */}
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <i className="bi bi-telephone text-primary"></i>
                        {editBasic ? (
                          <input
                            className="form-control w-50"
                            type="text"
                            value={basicData.phone}
                            onChange={(e) =>
                              setBasicData({ ...basicData, phone: e.target.value })
                            }
                          />
                        ) : (
                          <span>{profile.phone}</span>
                        )}
                      </div>
                      <div>
                        {/* EMAIL */}
                        <div className="col-md-6 mb-2 d-flex align-items-center gap-2">
                          <i className="bi bi-envelope text-primary"></i>
                          <span>{profile.email}</span>
                        </div>

                        {/* CATEGORY */}
                        <div className="col-md-6 mb-2 d-flex align-items-center gap-2">
                          <i className="bi bi-briefcase text-primary"></i>
                          <span>{profile.category}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {mode === "form" && (
              <>
                <div className="card shadow-sm border-0 mb-4 p-0" ref={identityRef} style={{ borderRadius: "12px" }}>
                  {/* CARD HEADER */}
                  <div className="card-header bg-blue d-flex justify-content-between align-items-center border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-check text-primary fs-20"></i>
                      <h5 className="mb-0 fw-semibold text-blue">Identity Verification</h5>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* Aadhar */}
                      <div className="col-md-4">
                        <label className="fw-semibold mb-1 fs-14">Aadhaar Number</label>

                        <div className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control placeholder-custom"
                            placeholder="1234 5678 9000"
                            maxLength={12}
                            value={formData.aadhar}
                            onChange={(e) =>
                              setFormData({ ...formData, aadhar: e.target.value })
                            }
                          />

                          <label className="btn btn-outline-primary mb-0 z-0">
                            <i className="bi bi-upload me-1"></i>
                            Upload
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  aadharFile: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>

                        <small
                          className="fs-12 d-block"
                          style={{ minHeight: "18px" }} // reserve space
                        >
                          {formData.aadharFile && (
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {formData.aadharFile.name}
                            </span>
                          )}
                        </small>
                      </div>

                      {/* PAN */}
                      <div className="col-md-4">
                        <label className="fw-semibold mb-1 fs-14">PAN Number</label>

                        <div className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control placeholder-custom"
                            placeholder="ABCDE1234F"
                            value={formData.pan}
                            onChange={(e) =>
                              setFormData({ ...formData, pan: e.target.value })
                            }
                          />

                          <label className="btn btn-outline-primary mb-0 z-0">
                            <i className="bi bi-upload me-1"></i>
                            Upload
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                setFormData({ ...formData, panFile: e.target.files[0] })
                              }
                            />
                          </label>
                        </div>

                        <small
                          className="fs-12 d-block"
                          style={{ minHeight: "18px" }}
                        >
                          {formData.panFile && (
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {formData.panFile.name}
                            </span>
                          )}
                        </small>

                      </div>

                      {/* Address Proof */}
                      <div className="col-md-4">
                        <label className="fw-semibold mb-1 fs-14">Address Proof</label>

                        <div className="input-group mb-2">
                          <select
                            className="form-select fs-14"
                            value={formData.addressProofType}
                            onChange={(e) =>
                              setFormData({ ...formData, addressProofType: e.target.value })
                            }
                          >
                            <option value="">Select</option>
                            <option value="passport">Passport</option>
                            <option value="voterId">Voter ID</option>
                            <option value="license">Driving License</option>
                          </select>

                          <label className="btn btn-outline-primary mb-0 z-0">
                            <i className="bi bi-upload me-1"></i>
                            Upload
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  addressProofFile: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        </div>

                        <small
                          className="fs-12 d-block"
                          style={{ minHeight: "18px" }}
                        >
                          {formData.addressProofFile && (
                            <span className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              {formData.addressProofFile.name}
                            </span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Experience */}
                <div id="qualification">
                  <div className="card shadow-sm border-0 mb-4 p-0" style={{ borderRadius: "12px" }}>
                    {/* CARD HEADER */}
                    <div className="card-header bg-blue d-flex justify-content-between align-items-center border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-marker-tip text-primary fs-20"></i>
                        <h5 className="mb-0 fw-semibold text-blue">Education & Experience</h5>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3 fs-14">


                        {/* Institution */}
                        <div className="col-md-4 gap-3">
                          <label className="fw-semibold mb-1">Institution / College Name:</label>
                          <input
                            className="form-control mb-3"
                            type="text"
                            value={formData.institution}
                            onChange={(e) =>
                              setFormData({ ...formData, institution: e.target.value })
                            }
                          />
                        </div>
                        {/* Qualification */}
                        <div className="col-md-4 gap-3">
                          <label className="fw-semibold mb-1">Qualification:</label>

                          {/* SELECT + FILE INPUT IN SINGLE FIELD */}
                          <div className="input-group mb-3">
                            <select
                              className="form-select fs-14"
                              value={formData.qualification}
                              onChange={(e) =>
                                setFormData({ ...formData, qualification: e.target.value })
                              }
                            >
                              <option value="">Select</option>
                              <option value="bsc">BSc</option>
                              <option value="physiotherapy">Physiotherapy</option>
                              <option value="others">Others</option>
                            </select>

                            <label className="btn btn-outline-primary mb-0">
                              <i className="bi bi-upload me-1"></i> Upload
                              <input
                                type="file"
                                hidden
                                onChange={(e) =>
                                  setFormData({ ...formData, qualificationFile: e.target.files[0] })
                                }
                              />
                            </label>
                          </div>

                          {/* SHOW TEXT INPUT ONLY IF 'Others' SELECTED */}
                          {formData.qualification === "others" && (
                            <input
                              className="form-control mb-3 placeholder-custom"
                              type="text"
                              placeholder="Specify Qualification"
                              value={formData.customQualification}
                              onChange={(e) =>
                                setFormData({ ...formData, customQualification: e.target.value })
                              }
                            />
                          )}

                          {/* SHOW FILE NAME IF UPLOADED */}
                          {formData.qualificationFile && (
                            <small className="text-success d-block fs-12">
                              <i className="bi bi-check-circle me-1"></i>
                              {formData.qualificationFile.name}
                            </small>
                          )}
                        </div>


                        {/* Experience */}
                        <div className="col-md-4 gap-3">
                          <label className="fw-semibold mb-1">Total Years of Experience:</label>
                          <input
                            className="form-control mb-3"
                            type="text"
                            value={formData.experience}
                            onChange={(e) =>
                              setFormData({ ...formData, experience: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      {/* Skills */}
                      <div className="row">
                        <div className="col-md-4">
                          <label className="fw-semibold mb-1">Skills & Services</label>

                          <div
                            className="border rounded bg-white p-2 d-flex flex-wrap gap-2 align-items-center"
                            style={{
                              minHeight: "60px",      // minimum height
                              maxHeight: "120px",     // fixed maximum height
                              overflowY: "auto",      // scroll if content exceeds maxHeight
                              background: "#f8fbff",
                            }}
                          >
                            {/* SKILL TAGS */}
                            {formData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="badge bg-primary-subtle text-primary d-flex align-items-center gap-1 px-3 py-2"
                                style={{ borderRadius: "20px", fontSize: "13px" }}
                              >
                                {skill}
                                <span
                                  className="ms-1 c-pointer"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      skills: formData.skills.filter((_, i) => i !== index),
                                    })
                                  }
                                >
                                  ×
                                </span>
                              </span>
                            ))}

                            {/* INPUT */}
                            <input
                              type="text"
                              className="border-0 flex-grow-1 fs-14"
                              placeholder="Add more skills..."
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && skillInput.trim()) {
                                  e.preventDefault();
                                  setFormData({
                                    ...formData,
                                    skills: [...formData.skills, skillInput.trim()],
                                  });
                                  setSkillInput("");
                                }
                              }}
                              style={{ outline: "none", background: "transparent" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Submit Button */}
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary mt-2 mb-2"
                    disabled={submitting}
                    onClick={async () => {
                      await submitProfessionalProfile(
                        formData,
                        setFormError,
                        setSubmitting
                      );
                      await fetchProfile();   // 🔁 reload DB data
                      setMode("view");        // switch UI
                    }}
                  >

                    {submitting ? "Submitting..." : "Submit for Verification"}
                  </button>
                </div>
              </>
            )}

            {mode === "view" && (
              <div className="row">
                <div className="col-md-6  mb-3">
                  <div className="card p-0">
                    <div className="card-header bg-blue d-flex align-items-center border-bottom">
                      <i className="bi bi-person-check text-primary fs-20 me-2"></i>
                      <h5 className="mb-0 fw-semibold text-blue">Identity Verification</h5>
                    </div>

                    <div className="card-body fs-16">
                      {/* Aadhaar */}
                      <div className="row fs-16">
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">Aadhaar:</label>
                          <p className="text-blue mt-10 mb-10">{profile.aadhar}</p>
                        </div>


                        {/* PAN */}
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">PAN:</label>
                          <p className="text-blue mt-10 mb-10">{profile.pan}</p>
                        </div>
                      </div>
                      <div className="row fs-16">
                        {/* Address Proof */}
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">Address Proof:</label>
                          <p className="text-blue text-capitalize mt-10 mb-10">
                            {profile.address_proof_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6  mb-3">
                  <div className="card p-0">
                    <div className="card-header bg-blue d-flex justify-content-between align-items-center border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-marker-tip text-primary fs-20"></i>
                        <h5 className="mb-0 fw-semibold text-blue">Education & Experience</h5>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row fs-16">
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">Qualification: </label>
                          <p className="text-blue mt-10 mb-10">{profile.qualification}</p>
                        </div>
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">Institution: </label>
                          <p className="text-blue mt-10 mb-10">{profile.institution}</p>
                        </div></div>
                      <div className="row fs-16">
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">Experience: </label>
                          <p className="text-blue mt-10 mb-10">{profile.experience}</p>
                        </div>
                        <div className="col-md-6 d-flex gap-3 align-items-center">
                          <label className="fw-semibold">Skills: </label>
                          <p className="text-blue mt-10 mb-10"> {Array.isArray(profile.skills) ? profile.skills.join(", ") : ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};


export default ProfessionalsRegister;
