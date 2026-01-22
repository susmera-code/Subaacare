import { useState, useEffect } from "react";
import CountryCodeSelect from "./CountryCodeSelect";
import { initRegisterValidation } from "./registerValidation";
import Terms from "./Terms";
import PasswordInput from "./PasswordInput";

export default function Register() {
  const [isProfessional, setIsProfessional] = useState(false);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [proCategory, setProCategory] = useState("");      // selected category
  const [customCategory, setCustomCategory] = useState(""); // only for "Others"

  useEffect(() => {
    initRegisterValidation(isProfessional);
  }, [isProfessional]);

  useEffect(() => {
    // Fetch India states
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.states) {
          setStates(data.data.states);
        }
      })
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  return (
    <div className="container mt-4">
      {/* Toggle Switch */}
      <div className="form-check form-switch mb-4">
        <div className="d-flex justify-content-center align-items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsProfessional(false); // show patient form
            }}
            className="fw-semibold text-decoration-none text-primary">
            Patient
          </a>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isProfessional}
              onChange={() => setIsProfessional(!isProfessional)} />
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsProfessional(true); // show professional form
            }}
            className="fw-semibold text-decoration-none text-primary">
            Professional
          </a>
        </div>
      </div>

      {/* Conditional Component */}

      {!isProfessional ?
        <div className="login-container d-flex align-items-center justify-content-center input-with-icon">
          <div className="login-card p-4 shadow-lg rounded-4 bg-white">

            <h3 className="text-center mb-1 fw-bold text-primary">Register</h3>
            <p className="fs-12 mb-3 login-message text-blue">Welcome to Heathcare. Please login to your account.</p>
            <div id="formError" className="text-danger fs-14"></div>

            <form id="registerForm">
              {/* Full Name */}
              <div className="mb-3 position-relative text-start fs-14">
                <label className="fw-bold mb-1">Full Name</label>
                <div className="position-relative">
                  <input
                    type="text" id="fullName"
                    className=" form-control placeholder-custom"
                    placeholder="Enter full name"
                  />
                  <i className="bi bi-person-fill"></i>
                </div>
                <small className="error" id="fullNameError"></small>
              </div>

              {/* Email */}
              <div className="mb-3 position-relative text-start fs-14">
                <label className="fw-bold mb-1">Email</label>
                <div className="position-relative">
                  <input
                    type="email" id="email"
                    className="form-control placeholder-custom"
                    placeholder="Enter email"
                  />
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <small className="error" id="emailError"></small>
              </div>

              {/* Phone */}
              <div className="mb-3 position-relative text-start fs-14">
                <label className="fw-bold mb-1">Phone</label>
                <div className="d-flex position-relative gap-2">
                  <CountryCodeSelect defaultCode="+91" />
                  <input
                    type="text" id="phone"
                    className="form-control w-60 placeholder-custom"
                    placeholder="Phone" maxLength="10"
                  />
                  <i className="bi bi-telephone-fill text-gray-500"></i>
                </div>
                <small className="error" id="phoneError"></small>
              </div>

              {/*  Password */}
              <PasswordInput
                id="password"
                label="Password"
                placeholder="Enter password"
                errorId="passwordError"
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter password"
                errorId="confirmPasswordError"
              />

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="termsPatient"
                />
                <label className="form-check-label d-flex fs-14 p-t-1" htmlFor="termsPatient">
                  I accept the{" "}
                  <a className="ml-5"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsOpen(true);
                    }}
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>
              <small className="error text-danger" id="termsError"></small>
              <button className="btn btn-primary w-100">
                Register
              </button>
            </form>
            <p className="text-center fs-14 mt-4 text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-link-600 fw-semibold">
                Login
              </a>
            </p>
          </div>
        </div>

        : <div className="login-container d-flex align-items-center justify-content-center input-with-icon">
          <div className="login-card p-4 shadow-lg rounded-4 bg-white">
            <h3 className="text-center mb-1 fw-bold text-primary">Register</h3>
            <p className="fs-12 mb-3 login-message">Welcome to Heathcare. Please login to your account.</p>
            <div id="formError" className="text-danger fs-14"></div>
            {/* Full Name */}
            <div className="mb-3 position-relative text-start fs-14">
              <label className="fw-bold mb-1">Full Name</label>
              <div className="position-relative">
                <input
                  type="text" id="proFullName"
                  className=" form-control placeholder-custom"
                  placeholder="Enter full name"
                />
                <i className="bi bi-person-fill"></i>
              </div>
              <small className="error" id="proFullNameError"></small>
            </div>

            {/* Email */}
            <div className="mb-3 position-relative text-start fs-14">
              <label className="fw-bold mb-1">Email</label>
              <div className="position-relative">
                <input
                  type="email" id="proEmail"
                  className="form-control placeholder-custom"
                  placeholder="Enter email" />
                <i className="bi bi-envelope-fill"></i>
              </div>
              <small className="error" id="proEmailError"></small>
            </div>

            {/* Phone */}
            <div className="mb-3 position-relative text-start fs-14">
              <label className="fw-bold mb-1">Phone</label>
              <div className="d-flex position-relative gap-2">
                <CountryCodeSelect defaultCode="+91" />
                <input
                  type="text" id="proPhone"
                  className="form-control w-60 placeholder-custom"
                  placeholder="Phone" maxLength="10"
                />
                <i className="bi bi-telephone-fill text-gray-500"></i>
              </div>
              <small className="error" id="proPhoneError"></small>
            </div>

            {/* State and City field */}
            <div className="mb-3 d-flex position-relative text-start fs-14 gap-2">
              <div className="w-50"><label className="fw-bold mb-1">State</label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="form-select w-100 fs-14"
                >
                  <option value="">Select</option>
                  {states.map((st) => (
                    <option key={st.name} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>

                <small className="error" id="stateError"></small>
              </div>
              {/* City field */}
              <div className="w-50"><label className="fw-bold mb-1">City</label>
                <input id="city" className="form-control w-100" type="text" />
                <small className="error" id="cityError"></small>
              </div>
            </div>

            {/* Category field */}
            <div className="mb-3 position-relative text-start fs-14">
              <label className="fw-bold mb-1">Category</label>

              <select
                id="category"
                className="form-select fs-14 mb-3"
                value={proCategory}
                onChange={(e) => {
                  setProCategory(e.target.value);
                  if (e.target.value !== "Others") setCustomCategory(""); // reset custom
                }}
              >
                <option value="">Select</option>
                <option value="Nurse">Nurse</option>
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Others">Others</option>
              </select>
              {proCategory === "Others" && (
                <div className="mb-3 position-relative text-start fs-14">
                  <label className="fw-bold mb-1">Specify Category</label>
                  <input
                    type="text"
                    id="customCategory" // 🔹 important
                    className="form-control placeholder-custom"
                    placeholder="Enter your category"
                  />
                  <small className="error" id="customCategoryError"></small>
                </div>
              )}

              <small className="error" id="categoryError"></small>
            </div>

            {/*  Password */}
            <PasswordInput
              id="proPassword"
              label="Password"
              placeholder="Enter password"
              errorId="proPasswordError"
            />

            <PasswordInput
              id="proConfirmPassword"
              label="Confirm Password"
              placeholder="Re-enter password"
              errorId="proConfirmPasswordError"
            />

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="termsPro"
              />
              <label className="form-check-label d-flex fs-14 p-t-1" htmlFor="termsPro">
                I accept the{" "}
                <a className="ml-5"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTermsOpen(true);
                  }}
                >
                  Terms & Conditions
                </a>
              </label>
            </div>
            <small className="error text-danger" id="proTermsError"></small>
            <button id="professionalRegisterBtn" className="btn btn-primary w-100">
              Register
            </button>
            <p className="text-center fs-14 mt-4 text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-link-600 fw-semibold">
                Login
              </a>
            </p>
          </div>
        </div>
      }
      <Terms isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
