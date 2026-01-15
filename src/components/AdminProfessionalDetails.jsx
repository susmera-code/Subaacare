import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminProfessionalDetails() {
    const [aadharUrl, setAadharUrl] = useState(null);
    const [panUrl, setPanUrl] = useState(null);
    const [addressUrl, setAddressUrl] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [pro, setPro] = useState(null);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        const { data, error } = await supabase
            .from("professionals")
            .select("*")
            .eq("id", id)
            .single();

        if (!error) setPro(data);
    };
    const getSignedUrl = async (path) => {
        if (!path) return null;

        const { data, error } = await supabase.storage
            .from("professionals-files")
            .createSignedUrl(path, 60); // 60 seconds

        if (error) {
            console.error(error);
            return null;
        }

        return data.signedUrl;
    };
    useEffect(() => {
        if (!pro) return;

        const loadUrls = async () => {
            setAadharUrl(await getSignedUrl(pro.aadhar_file));
            setPanUrl(await getSignedUrl(pro.pan_file));
            setAddressUrl(await getSignedUrl(pro.address_proof_file));
        };

        loadUrls();
    }, [pro]);

    if (!pro) return <p>Loading...</p>;

    return (
        <div className="container">
            <div className="card">
                <div className="text-start mt-3">
                    <div className="row">
                        <button className="btn btn-light btn-back col-md-2" onClick={() => navigate(-1)}>Back</button>

                        <h2 className="text-center fw-semibold col-md-10">{pro.full_name}</h2></div><br />
                    <div className="row fs-15 mb-2 mt-3">
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Email: </label>
                            <p className="text-blue">{pro.email}</p>
                        </div>
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Phone: </label>
                            <p className="text-blue">{pro.phone}</p>
                        </div>
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Category: </label>
                            <p className="text-blue">{pro.category}</p>
                        </div>
                         <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">PAN: </label>
                            <p className="text-blue d-flex gap-3">{pro.pan}
                                {panUrl && (
                                    <a className="fs-14" href={panUrl} target="_blank" rel="noreferrer">
                                        View PAN
                                    </a>
                                )} </p>
                        </div>
                    </div>
                    <div className="row fs-15">
                         <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Aadhar: </label>
                            <p className="text-blue d-flex gap-3">{pro.aadhar}
                                {aadharUrl && (
                                    <a className="fs-14" href={aadharUrl} target="_blank" rel="noreferrer">
                                        View Aadhar
                                    </a>
                                )}
                            </p>
                        </div>
                      
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Experience: </label>
                            <p className="text-blue">{pro.experience} years  </p>
                        </div>
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Qualification: </label>
                            <p className="text-blue">{pro.qualification}  </p>
                        </div>
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Institution: </label>
                            <p className="text-blue">{pro.institution}  </p>
                        </div>

                    </div>
                    <div className="row fs-15">
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            <label className="fw-semibold">Skills: </label>
                            <p className="text-blue">{pro.skills}  </p>
                        </div>
                        <div className="col-md-3 d-flex gap-3 align-items-center">
                            {addressUrl && (
                                <a className="fs-14" href={addressUrl} target="_blank" rel="noreferrer">
                                    View Address Proof
                                </a>
                            )}  </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
