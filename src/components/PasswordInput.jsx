import { useState } from "react";

export default function PasswordInput({
  id,
  label,
  placeholder,
  errorId,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-3 position-relative text-start fs-14 password-icon">
      <label className="fw-bold mb-1">{label}</label>

      <div className="position-relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          className="form-control pe-5 placeholder-custom"
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="password-btn"
        >
          <i
            className={`bi ${show ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
          ></i>
        </button>
      </div>

      <small className="error" id={errorId}></small>
    </div>
  );
}
