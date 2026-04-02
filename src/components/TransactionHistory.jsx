import { useEffect, useState } from "react";
import { supabase } from "../components/supabaseClient";
import generatePaymentInvoice from "../utils/generatePaymentInvoice";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);
    const handleInvoiceDownload = (t) => {
        if (t.payment_status === "paid") {
            generatePaymentInvoice(t);
        } else if (
            t.payment_status === "refund initiated" ||
            t.payment_status === "refunded"
        ) {
            generateRefundInvoice(t);
        }
    };
    const fetchTransactions = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("appointments")
            .select(`
        id,
        payment_status,
        razorpay_payment_id,
        from_datetime,
        professionals(full_name)
      `)
            .eq("patient_id", user.id)
            .in("payment_status", ["paid", "refund initiated", "refunded"]) // ✅ FILTER ADDED
            .order("from_datetime", { ascending: false });

        if (!error) setTransactions(data);
    };

    return (
        <div className="container mt-4">
            <h4 className="fw-semibold mb-4 text-blue">Transaction History</h4>

            {transactions.length === 0 ? (
                <p className="text-muted">No transactions found</p>
            ) : (
                <table className="table table-striped table-bordered mt-4">
                    <thead className="table-primary">
                        <tr>
                            <th className="text-blue">Professional</th>
                            <th className="text-blue">Date</th>
                            <th className="text-blue">Payment ID</th>
                            <th className="text-blue">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id}>
                                <td>{t.professionals?.full_name}</td>

                                <td>{new Date(t.from_datetime).toLocaleString()}</td>

                                <td>{t.razorpay_payment_id || "-"}</td>

                                <td>
                                    <span
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleInvoiceDownload(t)}
                                    >
                                        {t.payment_status === "paid" && (
                                            <span className="badge bg-success">Paid</span>
                                        )}

                                        {t.payment_status === "refund initiated" && (
                                            <span className="badge bg-warning text-dark">
                                                Refund Initiated
                                            </span>
                                        )}

                                        {t.payment_status === "refunded" && (
                                            <span className="badge bg-info text-white">
                                                Refunded
                                            </span>
                                        )}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionHistory;