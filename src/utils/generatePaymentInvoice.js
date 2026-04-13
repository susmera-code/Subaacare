import jsPDF from "jspdf";

const generatePaymentInvoice = (appt) => {
  const doc = new jsPDF();

  // ---------- Header ----------
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", 105, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: PAY-${appt.id}`, 20, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 35);

  doc.line(20, 40, 190, 40); // horizontal line

  // ---------- Patient Info ----------
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Details", 20, 50);

  doc.setFont("helvetica", "normal");

  const patientName =
    appt.patients?.full_name ||
    appt.patient?.full_name ||
    appt.patient_name ||
    appt.full_name ||
    "Patient";

  doc.text(`Name: ${patientName}`, 20, 58);

  // ---------- Payment Info ----------
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", 20, 70);

  doc.setFont("helvetica", "normal");
  doc.text(`Payment ID: ${appt.razorpay_payment_id || "-"}`, 20, 78);

  doc.text(
    `Appointment Date: ${new Date(appt.from_datetime).toLocaleString()}`,
    20,
    88
  );

  // ---------- Table Header ----------
  const tableTop = 105;
  doc.setFont("helvetica", "bold");
  doc.text("Description", 20, tableTop);
  doc.text("Amount (Rs.)", 160, tableTop, { align: "right" });
  doc.line(20, tableTop + 2, 190, tableTop + 2);

  // ---------- Table Row ----------
  const amount = 500; // replace with actual value
  const rowY = tableTop + 15;

  const professionalName = appt.professionals?.full_name || "Professional";

  doc.setFont("helvetica", "normal");
  doc.text(
    `Appointment fee for ${professionalName}`,
    20,
    rowY
  );

  doc.text(`${amount}`, 160, rowY, { align: "right" });

  doc.line(20, rowY + 5, 190, rowY + 5);

  // ---------- Total ----------
  doc.setFont("helvetica", "bold");
  doc.text("Total Paid:", 20, rowY + 20);
  doc.text(`Rs. ${amount}`, 160, rowY + 20, { align: "right" });

  // ---------- Footer ----------
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Thank you for your payment! For any queries, contact support@example.com",
    105,
    280,
    { align: "center" }
  );

  // Save PDF
  doc.save(`Payment_Invoice_${appt.id}.pdf`);
};

export default generatePaymentInvoice;