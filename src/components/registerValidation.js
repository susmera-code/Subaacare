// registerValidation.js
import { supabase } from "./supabaseClient";

export function initRegisterValidation(isProfessional, selectedState) {
  const formErrorEl = document.getElementById("formError");
  if (formErrorEl) formErrorEl.innerText = ""; // Clear error on toggle

  // Clear previous listeners
  const patientForm = document.getElementById("registerForm");
  const proBtn = document.getElementById("professionalRegisterBtn");

  if (patientForm) patientForm.onsubmit = null;
  if (proBtn) proBtn.onclick = null;

  // Helper functions
  const showFormError = (msg) => {
    if (formErrorEl) formErrorEl.innerText = msg;
  };
  const clearFormError = () => {
    if (formErrorEl) formErrorEl.innerText = "";
  };

  const attachClearFormErrorOnInput = (ids) => {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", clearFormError);
      el.addEventListener("change", clearFormError); // for selects
    });
  };
  const isValidEmail = (email) => {
    // Simple regex for basic email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };


  // ---------------- PATIENT ----------------
  if (!isProfessional) {
    if (!patientForm) return;

    attachClearFormErrorOnInput([
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ]);
const termsCheckbox = document.getElementById("termsPatient");
if (termsCheckbox) {
  termsCheckbox.addEventListener("change", clearFormError);
}

    patientForm.onsubmit = async (e) => {
      e.preventDefault();
      clearFormError();

      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const termsChecked = document.getElementById("termsPatient").checked;
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        showFormError("All fields are required");
        return;
      }
      if (!termsChecked) {
        document.getElementById("termsError").innerText =
          "You must accept Terms & Conditions";
        return;
      } else {
        document.getElementById("termsError").innerText = "";
      }
      if (!isValidEmail(email)) {
        showFormError("Please enter a valid email address");
        return;
      }
      if (password !== confirmPassword) {
        showFormError("Passwords do not match");
        return;
      }

      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: "patient" } },
      });
      if (signUpError) return showFormError(signUpError.message);

      // Sign in
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return showFormError(signInError.message);

      const userId = signInData.user.id;

      // Insert into patients
      const { error: dbError } = await supabase.from("patients").insert({
        id: userId,
        full_name: fullName,
        email,
        phone,
        role: "patient",
      });

      if (dbError) showFormError(dbError.message);
      else {
        alert("Patient registration successful!");
        patientForm.reset();
      }
    };
  }

  // ---------------- PROFESSIONAL ----------------
  else {
    if (!proBtn) return;

    attachClearFormErrorOnInput([
      "proFullName",
      "proEmail",
      "proPhone",
      "state",
      "city",
      "category",
      "proPassword",
      "proConfirmPassword",
    ]);

    proBtn.onclick = async (e) => {
      e.preventDefault();
      clearFormError();

      const proFullName = document.getElementById("proFullName").value.trim();
      const email = document.getElementById("proEmail").value.trim();
      const proPhone = document.getElementById("proPhone").value.trim();
      const state = document.getElementById("state").value;
      const city = document.getElementById("city").value.trim();
      const category = document.getElementById("category").value;
      const password = document.getElementById("proPassword").value;
      const confirmPassword = document.getElementById("proConfirmPassword").value;
      const termsChecked = document.getElementById("termsPro").checked;
      if (
        !proFullName ||
        !email ||
        !proPhone ||
        !state ||
        !city ||
        !category ||
        !password ||
        !confirmPassword
      ) {
        showFormError("All fields are required");
        return;
      }
      if (!termsChecked) {
        document.getElementById("proTermsError").innerText =
          "You must accept Terms & Conditions";
        return;
      } else {
        document.getElementById("proTermsError").innerText = "";
      }

      if (!isValidEmail(email)) {
        showFormError("Please enter a valid email address");
        return;
      }
      if (password !== confirmPassword) {
        showFormError("Passwords do not match");
        return;
      }

      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: "professional" } },
      });
      if (signUpError) return showFormError(signUpError.message);

      // Sign in
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) return showFormError(signInError.message);

      const userId = signInData.user.id;

      // Insert into professionals
      // 🔹 INSERT PROFESSIONAL ROW (IMPORTANT)
      const { error: dbError } = await supabase
        .from("professionals")
        .insert({
          id: userId,
          full_name: proFullName,
          email,
          phone: proPhone,
          state,
          city,
          category,
          role: "professional",
          profile_submitted: false,
          status: null,
        });

      if (dbError) {
        showFormError(dbError.message);
        return;
      }

      alert("Professional registration successful!");

    };
  }
}
