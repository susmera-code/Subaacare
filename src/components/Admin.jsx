import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function Admin() {
  const [professionals, setProfessionals] = useState([]);
  const [rejectingPro, setRejectingPro] = useState(null); // professional being rejected
  const [rejectReason, setRejectReason] = useState(""); // reason input
  const [showModal, setShowModal] = useState(false); // modal visibility
  const navigate = useNavigate(); // ✅ REQUIRED

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const ok = await isAdmin();
      if (!ok) {
        navigate("/login");
        return;
      }
      fetchProfessionals(); // ✅ FETCH DATA
    };

    checkAdminAndFetch();
  }, []);

  // const fetchProfessionals = async () => {
  //  const { data, error } = await supabase
  //   .from("professionals")
  //   .select("id, full_name, category, status")
  //   .eq("profile_submitted", true)
  //   .eq("status", "pending")
  //   .order("created_at", { ascending: false });


  //   if (error) {
  //     console.error("Fetch professionals error:", error);
  //   } else {
  //     setProfessionals(data || []);
  //   }
  // };

  const fetchProfessionals = async () => {
    const { data, error } = await supabase
      .from("professionals")
      .select(`
      id,
      full_name,
      category,
      status,
      phone,
      email
    `)
      .or(
        "status.eq.pending"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch professionals error:", error);
    } else {
      setProfessionals(data || []);
    }
  };


  const handleRejectClick = (pro) => {
    setRejectingPro(pro);
    setRejectReason("");
    setShowModal(true);
  };

  const submitReject = async () => {
    const { data, error } = await supabase
      .from("professionals")
      .update({
        status: "rejected",
        rejection_reason: rejectReason
      })
      .eq("id", rejectingPro.id)
      .select();


    if (!error) {
      setShowModal(false);
      setRejectingPro(null);
      setRejectReason("");
      fetchProfessionals();
    }
  };


  const approveProfessional = async (id) => {
    const { data, error } = await supabase
      .from("professionals")
      .update({ status: "approved" })
      .eq("id", id)
      .select();

    console.log("Approve result:", data, error);

    if (!error) fetchProfessionals();
  };


  return (
    <div>
      <h2 className="mb-3">Professionals Approval</h2>
      <div className="table-responsive">
        <table className="container table table-md" border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="align-middle fs-15">
            {professionals.map((pro) => (
              <tr key={pro.id}>
                <td>
                  <Link to={`/admin/professional/${pro.id}`}>
                    {pro.full_name}
                  </Link>
                </td>

                <td>{pro.category}</td>

                <td>
                  {/* Profile Approval */}
                  {pro.status === "pending" && (
                    <>
                      <button
                        className="btn btn-success btn-approve fs-12"
                        onClick={() => approveProfessional(pro.id)}
                      >Approve</button>

                      <button
                        className="btn btn-danger btn-reject fs-12 ms-2"
                        onClick={() => handleRejectClick(pro)}
                      >Reject </button>
                    </>
                  )}

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Reject Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold">Reason for rejection</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Provide reason for rejecting <b>{rejectingPro.full_name}</b>:</p>
                <input
                  type="text"
                  className="form-control placeholder-custom"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary fs-12" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger fs-12" onClick={submitReject}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
