import Patient from "./Patient";
import { useState } from "react";
function Home() {
    return (
        <div className="container">
            <div className="card shadow-lg rounded-4 overflow-hidden mt-4">
                <div className="row g-0">
                    {/* Left Column – Text */}
                    <div className="col-md-6 d-flex flex-column justify-content-center p-4">
                        <h2 className="fw-bold text-primary mb-3">Comprehensive Family Healthcare</h2>
                        <p className="text-muted">
                            We provide trusted medical care for every generation — from children to seniors.
                            Your family’s wellbeing is our top priority.
                        </p>
                    </div>
                    {/* Right Column – Image */}
                    <div className="col-md-6">
                        <img
                            src="src/assets/Image1.png"     // <— Replace with your actual image path
                            className="img-fluid rounded-2 h-100 w-100 object-fit-cover"
                            alt="Family Healthcare"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Home;