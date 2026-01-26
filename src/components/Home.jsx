import { useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "../assets/Image1.png";
import nurseIcon from "../assets/nurse.png";
import physioIcon from "../assets/physio.png";
import verifiedIcon from "../assets/verified.svg";
import Subaa_Logo from "../assets/Subaa_Logo.png";
import noteIcon from "../assets/note.png";

function Home() {
    const [showMore, setShowMore] = useState(false);

    const navigate = useNavigate();
    const handleBooking = () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token) {
            console.log("Not logged in → redirect login");
            navigate("/login");
            return;
        }

        if (role && role.toLowerCase() === "patient") {
            console.log("Patient logged in → redirect patient");
            navigate("/patient");
            return;
        }
        console.log("Logged in but not patient → redirect login");
        navigate("/login");
    };

    return (
        <div>
            {/* ================= HERO SECTION ================= */}
            <div className="overflow-hidden mb-5 position-relative">
                <div className="row g-0 align-items-stretch min-vh-50">

                    {/* Left */}
                    <div className="col-md-7 d-flex align-items-center px-5 py-5 bg-grey position-relative">
                        <div>
                            <h1 className="fw-bold text-primary mb-3 text-start" style={{ fontSize: "2.3rem" }}>
                                Trusted Home Nursing & Physiotherapy
                                <span className="fw-normal"> —Booked in Minutes</span>
                            </h1>

                            <p className="text-muted mb-4 text-start">
                                Verified professionals, transparent pricing, and care delivered
                                at your doorstep across Chennai.
                            </p>

                            <div className="d-flex gap-3 mb-4">
                                <button type="button" className="btn btn-success px-4 py-2 fs-15" onClick={handleBooking}>
                                    Book a Nurse →
                                </button>
                                <button type="button" className="btn btn-success px-4 py-2 fs-15" onClick={handleBooking}>
                                    Book a Physiotherapist →
                                </button>
                            </div>

                            <div className="row text-muted small fs-16 text-start">
                                <div className="col-6"><i className="bi bi-check-circle-fill"></i> Verified Professionals</div>
                                <div className="col-6"><i className="bi bi-check-circle-fill"></i> Background Checks</div>
                                <div className="col-6"><i className="bi bi-check-circle-fill"></i> Flexible Slots</div>
                                <div className="col-6"><i className="bi bi-check-circle-fill"></i> Support & Escalation</div>
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="col-md-5 position-relative">
                        <img
                            src={heroImage}
                            alt="Home healthcare"
                            className="w-100 h-100 object-fit-cover"
                        />
                    </div>
                </div>

                {/* Blur Join */}
                <div className="hero-blur-divider d-none d-md-block"></div>
            </div>


            {/* ================= OUR SERVICES ================= */}
            <div className="container">
                <h2 className="text-center fw-bold mb-4 text-blue">Our Services</h2>

                <div className="row g-4 mb-5">
                    {/* Home Nursing */}

                    <div className="col-md-6">
                        <div className="card shadow-sm rounded-4 p-4 d-flex align-items-center">
                            <div className="d-flex align-items-start gap-3">
                                {/* Nurse Icon */}
                                <img
                                    src={nurseIcon}
                                    alt="Home healthcare"
                                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                />

                                <div className="d-flex flex-column">
                                    <h5 className="fw-bold mb-2 text-start text-blue fs-23">Home Nursing</h5>
                                    <ul className="list-unstyled mb-3 text-muted fs-16">
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Post-hospital care
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i>Elderly care
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Wound dressing & injections
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Vitals monitoring
                                        </li>
                                    </ul>
                                    <button className="btn btn-success align-self-start fs-14" onClick={handleBooking}>
                                        Book Nurse →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Physiotherapy */}

                    <div className="col-md-6">
                        <div className="card shadow-sm rounded-4 p-4 d-flex align-items-center">
                            <div className="d-flex align-items-start gap-3">
                                {/* Nurse Icon */}
                                <img
                                    src={physioIcon}
                                    alt="Physiotherapy"
                                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                />
                                <div className="d-flex flex-column">
                                    <h5 className="fw-bold mb-2 text-start text-blue fs-23">Physiotherapy</h5>
                                    <ul className="list-unstyled mb-3 text-muted fs-16">
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i>Stroke rehabilitation
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Post-op recovery
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Ortho & neuro physio
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Mobility improvement
                                        </li>
                                    </ul>
                                    <button className="btn btn-success align-self-start fs-14" onClick={handleBooking}>
                                        Book Physiotherapist →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* ================= WHY SUBAA CARE ================= */}
            <div className="container">
                <h2 className="text-center fw-bold mb-4 text-blue">Why Subaa Care</h2>

                <div className="row g-4 mb-5">
                    <div className="col-md-6">
                        <div className="card shadow-sm rounded-4 p-4 h-100">
                            <div className="d-flex align-items-start gap-3 text-muted">
                                <img src={Subaa_Logo} alt="Logo" className="logo" style={{ height: "8rem", padding: "0" }} />
                                <div className="d-flex flex-column text-start">
                                    <h5 className="fw-bold mb-3 text-blue fs-23">A Personal Turning Point</h5>
                                    <p>
                                        When the founder’s father suffered a stroke, he lost his ability to speak and
                                        experienced paralysis on the right side of his body.
                                        To support his recovery, the family transformed a one-bedroom home into a
                                        fully assisted care space, equipped with medical beds, mobility aids,
                                        physiotherapy support, and continuous nursing care.

                                        This experience revealed first-hand the emotional, physical, and logistical
                                        challenges families face when arranging quality home healthcare.
                                    </p>
                                </div></div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card shadow-sm rounded-4 p-4 h-100">
                            <div className="d-flex align-items-start gap-3">
                                <img src={Subaa_Logo} alt="Logo" className="logo" style={{ height: "8rem", padding: "0" }} />
                                <div className="d-flex flex-column text-start">
                                    <h5 className="fw-bold mb-3 text-blue fs-23">A Gap That Needed Attention</h5>
                                    <p className="text-muted">During this journey, it became evident that:</p>
                                    <ul className="list-unstyled mb-3 text-muted fs-16">
                                        <li className="d-flex gap-2">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Home healthcare services largely operate in an unorganized and referral-based ecosystem
                                        </li>
                                        <li className="d-flex gap-2">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Families struggle with trust, quality assurance, and professional accountability
                                        </li>
                                        <li className="d-flex gap-2">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Verifying credentials, experience, and background of caregivers is often difficult
                                        </li>
                                        <li className="d-flex gap-2">
                                            <i className="bi bi-check-circle-fill"></i>
                                            There is limited transparency in pricing, service standards, and escalation mechanisms
                                        </li>
                                    </ul>
                                    <button
                                        className="btn text-decoration-none btn-link p-0 text-blue text-end fs-14"
                                        onClick={() => setShowMore(!showMore)}
                                    >
                                        {showMore ? "Read less..." : "Read more..."}
                                    </button>
                                </div>
                            </div>
                            {showMore && (
                                <span className="text-start text-muted mt-3 d-block">
                                    This realization inspired the creation of <strong>Subaa Care</strong> — to organize,
                                    standardize, and elevate home healthcare services using technology, process
                                    discipline, and compassion.
                                </span>
                            )}

                        </div>
                    </div>
                </div>
                <div className="row g-4 mb-5">
                    <div className="col-md-6">
                        <div className="card shadow-sm rounded-4 p-4 h-100">
                            <div className="d-flex align-items-start gap-3">
                                {/* Verified Icon */}
                                <img
                                    src={verifiedIcon}
                                    alt="Home healthcare"
                                    style={{ width: '100px', objectFit: 'cover' }}
                                />
                                <div className="d-flex flex-column text-start">
                                    <h5 className="fw-bold mb-3 text-blue fs-23">Verified & Accountable</h5>

                                    <ul className="list-unstyled mb-3 text-muted fs-16">
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i>Qualification verification
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> ID validation
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i>Background & reference checks
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Ongoing performance monitoring
                                        </li>
                                    </ul>
                                </div></div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card shadow-sm rounded-4 p-4 h-100">
                            <div className="d-flex align-items-start gap-3">
                                <img
                                    src={noteIcon}
                                    alt="Transparancy"
                                    style={{ width: '135px', height: '95px', objectFit: 'cover' }}
                                />
                                <div className="d-flex flex-column text-start">
                                    <h5 className="fw-bold mb-3 text-blue fs-23">Care with Transparency</h5>
                                    <ul className="list-unstyled mb-3 text-muted fs-16">
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Clear pricing before booking
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i>Easy reschedule/cancellation
                                        </li>
                                        <li className="d-flex align-items-center gap-2">
                                            <i className="bi bi-check-circle-fill"></i> Support & escalation system
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ================= FAQs ================= */}
            <div className="container">
                <div className="row g-4 mb-5">
                    <div className="col-md-6">
                        <h4 className="fw-bold mb-3 text-start text-blue">FAQs</h4>

                        <div className="accordion" id="faqAccordion">
                            {[
                                {
                                    question: "What areas do you serve?",
                                    answer:
                                        "We currently provide home nursing and physiotherapy services across Chennai. Service availability may vary based on location and professional availability.",
                                },
                                {
                                    question: "Are the nurses and physiotherapists verified?",
                                    answer:
                                        "Yes, all our nurses and physiotherapists are thoroughly verified, certified, and experienced to ensure safe and professional care at home.",
                                },
                                {
                                    question: "Can I reschedule or cancel a booking?",
                                    answer:
                                        "Yes, bookings can be rescheduled or cancelled as per our policy. Please contact our support team in advance for assistance.",
                                },
                            ].map((item, i) => (
                                <div className="accordion-item" key={i}>
                                    <h2 className="accordion-header" id={`heading${i}`}>
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#faq${i}`}
                                            aria-expanded="false"
                                            aria-controls={`faq${i}`}
                                        >
                                            {item.question}
                                        </button>
                                    </h2>

                                    <div
                                        id={`faq${i}`}
                                        className="accordion-collapse collapse"
                                        aria-labelledby={`heading${i}`}
                                        data-bs-parent="#faqAccordion"
                                    >
                                        <div className="accordion-body text-muted text-start">
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Contact Card */}
                    <div className="col-md-6 mb-5">
                        <h4 className="fw-bold mb-3 text-start text-blue">Contact us</h4>
                        <div className="card shadow-sm rounded-4 p-4 text-start">
                            <h5 className="fw-bold mb-3">  <i className="bi bi-check-circle-fill fs-18"></i> Questions?</h5>

                            <div className="text-muted">
                                <strong>Subaa Care</strong>
                                <br />
                                T3 – Niruthi Apartments
                                <br />
                                65A, Kaliamman Koil Street
                                <br />
                                Virugambakkam
                                <br />
                                Chennai – 600 092
                            </div>
                            <p className="mb-2 text-muted">📞 Call or WhatsApp</p>
                            <h5 className="text-success fw-bold fs-15">+91 9739797720 </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
