// src/components/Terms.jsx
export default function Terms({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}   // 👈 click outside = close
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          height: "80vh",              // fixed modal height
          display: "flex",
          flexDirection: "column",
        }}

      >
        <div
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid #ddd",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <h4 className="m-0">Terms & Conditions</h4>
        </div>
        <div className="text-start"
          style={{
            padding: "20px",
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          <p>
            These Terms &amp; Conditions (“Terms”) govern the access and use of services provided by
            <strong>Subaa Care</strong> (“SC”, “we”, “our”, “us”), including the booking of nurses,
            physiotherapists, and allied healthcare professionals through the Subaa Care Platform
            (website and/or mobile application).
          </p>

          <p>
            By accessing, registering, or booking services through the Platform, you (“User”,
            “Patient”, “Professional”) agree to be bound by these Terms.
          </p>

          <h5>1. Nature of Services</h5>
          <p>Subaa Care is a healthcare service platform that enables:</p>
          <ul>
            <li>Patients to book qualified nurses and physiotherapists for home-based care</li>
            <li>Healthcare professionals to provide services through Subaa Care</li>
          </ul>
          <p>
            Subaa Care acts as a service provider and coordinator, not merely a technology intermediary.
          </p>

          <h5>2. Eligibility</h5>
          <ul>
            <li>Users must be 18 years or older</li>
            <li>Professionals must hold valid qualifications, registrations, and experience</li>
            <li>Accurate and complete information must be provided at all times</li>
          </ul>

          <h5>3. Professional Verification</h5>
          <p>Subaa Care undertakes:</p>
          <ul>
            <li>Identity verification</li>
            <li>Qualification and experience verification</li>
            <li>Background checks to the extent permitted by law</li>
          </ul>
          <p>
            However, healthcare outcomes may vary based on patient condition and external factors.
          </p>

          <h5>4. Medical Disclaimer</h5>
          <ul>
            <li>Services are supportive healthcare services, not emergency medical treatment</li>
            <li>Patients must disclose complete and accurate medical history</li>
            <li>In case of emergency, local emergency services must be contacted immediately</li>
          </ul>

          <h5>5. Liability &amp; Risk Assumption <strong>(IMPORTANT)</strong></h5>

          <h6>5.1 Subaa Care’s Responsibility</h6>
          <p>Subaa Care accepts responsibility and liability for risks arising from:</p>
          <ul>
            <li>Negligence or misconduct of professionals engaged through Subaa Care</li>
            <li>Failure in verification, onboarding, or allocation of professionals</li>
            <li>Platform-related failures that directly impact service delivery</li>
          </ul>

          <h6>5.2 Limitations</h6>
          <p>Subaa Care shall not be liable for:</p>
          <ul>
            <li>Pre-existing medical conditions not disclosed by the patient</li>
            <li>Complications arising from patient non-compliance with instructions</li>
            <li>Acts beyond reasonable control (force majeure events)</li>
          </ul>

          <h5>6. Patient Obligations</h5>
          <p>Patients agree to:</p>
          <ul>
            <li>Provide accurate health information</li>
            <li>Maintain a safe environment for professionals</li>
            <li>Follow prescribed care plans</li>
            <li>Treat professionals with dignity and respect</li>
          </ul>

          <h5>7. Professional Obligations</h5>
          <p>Professionals must:</p>
          <ul>
            <li>Adhere to medical ethics and applicable healthcare laws</li>
            <li>Maintain confidentiality</li>
            <li>Deliver services with due care and skill</li>
            <li>Report emergencies or adverse events immediately to Subaa Care</li>
          </ul>

          <h5>8. Payments &amp; Refunds</h5>
          <ul>
            <li>Fees are displayed transparently before booking</li>
            <li>Refunds and cancellations are subject to Subaa Care’s Refund Policy</li>
            <li>Subaa Care reserves the right to revise pricing</li>
          </ul>

          <h5>9. Confidentiality &amp; Data Protection</h5>
          <p>Subaa Care complies with applicable Indian data protection laws.</p>
          <ul>
            <li>Collected only for service delivery</li>
            <li>Stored securely</li>
            <li>Shared strictly on a need-to-know basis</li>
          </ul>

          <h5>10. Termination</h5>
          <p>Subaa Care may suspend or terminate accounts for:</p>
          <ul>
            <li>Fraud</li>
            <li>Abuse</li>
            <li>Misrepresentation</li>
            <li>Breach of these Terms</li>
          </ul>

          <h5>11. Indemnity</h5>
          <p>
            Users agree to indemnify Subaa Care against losses arising from:
          </p>
          <ul>
            <li>False disclosures</li>
            <li>Misuse of services</li>
            <li>Violation of law or these Terms</li>
          </ul>

          <h5>12. Force Majeure</h5>
          <p>
            Subaa Care is not liable for service disruption due to events beyond reasonable control
            including natural disasters, strikes, epidemics, or government actions.
          </p>

          <h5>13. Governing Law &amp; Jurisdiction</h5>
          <p>
            These Terms shall be governed by the laws of India.
            Courts at Chennai, Tamil Nadu shall have exclusive jurisdiction.
          </p>

          <h5>14. Contact Information</h5>
          <p>
            <strong>Subaa Care</strong><br />
            3, T3, Niruthi Apartments,<br />
            65 A, Kaliamman Koil Street,<br />
            Virugambakkam, Chennai – 600 091
          </p>
        </div>

        <div
          style={{
            padding: "15px 20px",
            borderTop: "1px solid #ddd",
            background: "#fff",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <button className="btn btn-primary w-100" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
