import { supabase } from "./supabaseClient";
const isValidAadhar = (value) => /^\d{12}$/.test(value);
const isValidPAN = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);

// Sanitize filenames
const sanitizeFileName = (fileName) => fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");

// Upload file helper
const uploadFile = async (file, folder) => {
  if (!file) return null;

  const sanitized = sanitizeFileName(file.name);
  const path = `${folder}/${Date.now()}_${sanitized}`;

  const { data, error } = await supabase.storage
    .from("professionals-files")
    .upload(path, file, { upsert: true });

  if (error) throw error;
  return data.path;
};

// Submit professional profile
export const submitProfessionalProfile = async (formData, setFormError, setSubmitting) => {
  setFormError("");

// Validate required fields
const requiredFields = [
  "aadhar", "aadharFile", "pan", "panFile",
  "addressProofType", "addressProofFile",
  "qualification", "institution", "experience", "skills"
];

for (let field of requiredFields) {
  if (!formData[field]) {
    setFormError("All fields are required.");
    return;
  }
}

// Aadhaar validation
if (!isValidAadhar(formData.aadhar)) {
  setFormError("Aadhaar number must be exactly 12 digits.");
  return;
}

// PAN validation
if (!isValidPAN(formData.pan.toUpperCase())) {
  setFormError("Invalid PAN number format (e.g. ABCDE1234F).");
  return;
}

// Qualification check
if (formData.qualification === "others" && !formData.customQualification) {
  setFormError("Please specify your qualification.");
  return;
}


  if (formData.qualification === "others" && !formData.customQualification) {
    setFormError("Please specify your qualification.");
    return;
  }

  setSubmitting(true);

  try {
    // Get logged-in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not logged in");

    const userId = user.id;

    // Upload files
    const aadharFilePath = await uploadFile(formData.aadharFile, "aadhar");
    const panFilePath = await uploadFile(formData.panFile, "pan");
    const addressProofFilePath = await uploadFile(formData.addressProofFile, "address-proof");
    const qualificationFilePath = await uploadFile(formData.qualificationFile, "qualification");

    // Update existing row in professionals table
   const { error } = await supabase
  .from("professionals")
  .update({
    aadhar: formData.aadhar,
    aadhar_file: aadharFilePath,

    pan: formData.pan.toUpperCase(), 
    pan_file: panFilePath,

    address_proof_type: formData.addressProofType,
    address_proof_file: addressProofFilePath,

    qualification: formData.qualification === "others"
      ? formData.customQualification
      : formData.qualification,
    custom_qualification: formData.qualification === "others"
      ? formData.customQualification
      : null,

    qualification_file: qualificationFilePath,
    institution: formData.institution,
    experience: parseInt(formData.experience, 10),
    skills: formData.skills,
    profile_submitted: true,
    status: "pending"
  })
  .eq("id", userId);


    if (error) throw error;

    alert("Professional profile updated successfully!");
  } catch (err) {
    console.error(err);
    setFormError(err.message || "Something went wrong while submitting profile.");
  } finally {
    setSubmitting(false);
  }
};
