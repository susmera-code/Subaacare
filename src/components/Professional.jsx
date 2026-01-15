import { useState, useEffect } from "react";
import { getUserProfile } from "./getUserProfile";
import { submitProfessionalProfile } from "./professionalFormValidation";
import ProfessionalStatus from "./ProfessionalStatus";
import { supabase } from "./supabaseClient";

const ProfessionalsRegister = () => {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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
    skills: "",
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
    <div className="container ">
      <div className="card">
        {formError && <div className="text-danger mb-3">{formError}</div>}
        <div className="text-start fs-15">
          {/* My Profile */}
          <div id="profile">
            <h3 className="text-center" style={{ color: "#063b84" }}>My Profile</h3>
            <div className="d-flex justify-content-between align-items-center">
              <div className="mb-4">
                <div
                  className="mb-2"
                  style={{
                    width: "120px",
                    height: "120px",
                    overflow: "hidden",
                    border: "1px solid #000",
                  }}>
                  <img
                    src={
                      photoPreview ||
                      profile?.profile_photo ||
                      "https://via.placeholder.com/120"
                    }
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="w-70 mx-auto fs-12"
                  onChange={(e) => handlePhotoChange(e)}
                />
              </div>
              <ProfessionalStatus status={profile.status} />
            </div>

            <div className="row mb-3 fs-14 ">
              <div className="col-md-3 d-flex gap-3 align-items-center">
                <label className="fw-semibold">Name: </label>
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
                  <p className="text-blue">{profile.full_name}</p>
                )}
              </div>

              <div className="col-md-3 d-flex gap-3 align-items-center">
                <label className="fw-semibold">Phone: </label>
                {editBasic ? (
                  <input
                    className="form-control"
                    type="text"
                    value={basicData.phone}
                    onChange={(e) =>
                      setBasicData({ ...basicData, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-blue">{profile.phone}</p>
                )}
              </div>
              <div className="col-md-3 d-flex gap-3 align-items-center">
                <label className="fw-semibold">Email: </label>
                <p className="text-blue">{profile.email}</p>
              </div>
              <div className="col-md-3 d-flex gap-3 align-items-center">
                <label className="fw-semibold">Category: </label>
                <p className="text-blue">{profile.category}</p>
              </div>
            </div>
            {mode === "form" && (
              <>
                <div className="row fs-14">
                  {/* Aadhar */}
                  <div className="col-md-3 gap-3">
                    <label className="fw-semibold mb-1">Aadhar Number:</label>
                    <input
                      className="form-control mb-3 placeholder-custom"
                      placeholder="e.g. 123456789000"
                      type="text"
                      value={formData.aadhar}
                      onChange={(e) =>
                        setFormData({ ...formData, aadhar: e.target.value })
                      }
                    />
                    <input
                      className="fs-12"
                      type="file"
                      onChange={(e) =>
                        setFormData({ ...formData, aadharFile: e.target.files[0] })
                      }
                    />
                  </div>

                  {/* PAN */}
                  <div className="col-md-3 gap-3">
                    <label className="fw-semibold mb-1">PAN Number:</label>
                    <input
                      className="form-control mb-3 placeholder-custom"
                      placeholder="e.g. ABCDE1234F"
                      type="text"
                      value={formData.pan}
                      onChange={(e) =>
                        setFormData({ ...formData, pan: e.target.value })
                      }
                    />
                    <input
                      className="fs-12"
                      type="file"
                      onChange={(e) =>
                        setFormData({ ...formData, panFile: e.target.files[0] })
                      }
                    />
                  </div>

                  {/* Address Proof */}
                  <div className="col-md-3 gap-3">
                    <label className="fw-semibold mb-1">Address Proof:</label>
                    <select
                      className="form-select mb-3 fs-14"
                      value={formData.addressProofType}
                      onChange={(e) =>
                        setFormData({ ...formData, addressProofType: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="passport">Passport</option>
                      <option value="voterId">Voter ID</option>
                      <option value="license">License</option>
                    </select>
                    <input
                      className="fs-12"
                      type="file"
                      onChange={(e) =>
                        setFormData({ ...formData, addressProofFile: e.target.files[0] })
                      }
                    />
                  </div>
                </div>

                <hr />

                {/* Education & Experience */}
                <div id="qualification">
                  <h3 className="mb-5">Education & Experience</h3>
                  <div className="row mb-3 fs-14">
                    {/* Qualification */}
                    <div className="col-md-3 gap-3">
                      <label className="fw-semibold mb-1">Qualification:</label>
                      <select
                        className="form-select mb-3 fs-14"
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

                      {formData.qualification === "others" && (
                        <input
                          className="form-control mt-3 mb-3 placeholder-custom"
                          type="text"
                          placeholder="Specify Qualification"
                          value={formData.customQualification}
                          onChange={(e) =>
                            setFormData({ ...formData, customQualification: e.target.value })
                          }
                        />
                      )}

                      <input
                        className="fs-12"
                        type="file"
                        onChange={(e) =>
                          setFormData({ ...formData, qualificationFile: e.target.files[0] })
                        }
                      />
                    </div>

                    {/* Institution */}
                    <div className="col-md-3 gap-3">
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

                    {/* Experience */}
                    <div className="col-md-3 gap-3">
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

                    {/* Skills */}
                    <div className="col-md-3 gap-3">
                      <label className="fw-semibold mb-1">Skills</label>
                      <textarea
                        className="form-control placeholder-custom"
                        placeholder="e.g. Nursing, Patient Care, Physiotherapy"
                        value={formData.skills}
                        onChange={(e) =>
                          setFormData({ ...formData, skills: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary mt-3"
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

                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </>
            )}

            {mode === "view" && (
              <div>
                <div className="row mb-3 fs-14">
                  <div className="col-md-3 d-flex gap-3 align-items-center">
                    <label className="fw-semibold">Qualification: </label>
                    <p className="text-blue">{profile.qualification}</p>
                  </div>
                  <div className="col-md-3 d-flex gap-3 align-items-center">
                    <label className="fw-semibold">Institution: </label>
                    <p className="text-blue">{profile.institution}</p>
                  </div>
                  <div className="col-md-3 d-flex gap-3 align-items-center">
                    <label className="fw-semibold">Experience: </label>
                    <p className="text-blue">{profile.experience}</p>
                  </div>
                  <div className="col-md-3 d-flex gap-3 align-items-center">
                    <label className="fw-semibold">Skills: </label>
                    <p className="text-blue">{profile.skills}</p>
                  </div>
                </div>
              </div>
            )}

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
      </div>
    </div>
  );
};


export default ProfessionalsRegister;
