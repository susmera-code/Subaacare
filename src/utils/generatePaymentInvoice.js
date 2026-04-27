import jsPDF from "jspdf";
import logo from "../assets/Subaa_Logo.png";

const generatePaymentInvoice = (appt) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---------------- SAFE DATA ----------------
  const patientName =
    appt.patients?.full_name ||
    appt.patient?.full_name ||
    "Patient";

  const professionalName =
    appt.professionals?.full_name ||
    "Professional";

  const amount = appt.amount || appt.fee || 500;

  const paymentId = appt.razorpay_payment_id || "-";

  const proEmail = appt.professionals?.email || "";
  const proPhone = appt.professionals?.phone || "";

  const patientEmail =
    appt.patients?.email || appt.patient?.email || "";

  const patientPhone =
    appt.patients?.phone || appt.patient?.phone || "";

  // ---------------- HEADER ----------------
  doc.setTextColor(128, 0, 128);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 20);

  doc.setTextColor(0, 0, 0);

  const logoWidth = 35;
  const logoHeight = 18;

  const logoX = pageWidth - logoWidth - 20;
  const logoY = 10;

  doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);

  doc.setFontSize(10);
  doc.text(`Invoice No: PAY-${appt.id}`, 20, 35);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 42);

  doc.line(20, 45, 190, 45);

  // ---------------- CURSOR SYSTEM ----------------
  let cursorY = 55;

  // ======================================================
  // LEFT: PROFESSIONAL
  // ======================================================
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To", 20, cursorY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  let leftY = cursorY + 8;

  const proAddressLines = [
    appt.professionals?.address,
    appt.professionals?.city,
    appt.professionals?.state,
    appt.professionals?.pincode,
  ].filter(Boolean);

  doc.text(`Name: ${professionalName}`, 20, leftY);
  leftY += 8;

  doc.text("Address:", 20, leftY);
  leftY += 6;

  proAddressLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 80);
    wrapped.forEach((w) => {
      doc.text(w, 25, leftY);
      leftY += 6;
    });
  });

  leftY += 4;
  doc.text(`Email: ${proEmail}`, 20, leftY);
  leftY += 8;
  doc.text(`Phone: ${proPhone}`, 20, leftY);

  // ======================================================
  // RIGHT: PATIENT
  // ======================================================
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Billed By", 120, cursorY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  let rightY = cursorY + 8;

  const patientAddressLines = [
    appt.patients?.address,
    appt.patients?.city,
    [appt.patients?.state, appt.patients?.pincode].filter(Boolean).join(" "),
  ].filter(Boolean);

  doc.text(`Name: ${patientName}`, 120, rightY);
  rightY += 8;

  doc.text("Address:", 120, rightY);
  rightY += 6;

  patientAddressLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 70);
    wrapped.forEach((w) => {
      doc.text(w, 125, rightY);
      rightY += 6;
    });
  });

  rightY += 4;
  doc.text(`Email: ${patientEmail}`, 120, rightY);
  rightY += 8;
  doc.text(`Phone: ${patientPhone}`, 120, rightY);

  // ======================================================
  // SECTION BOTTOM CALCULATION
  // ======================================================
  cursorY = Math.max(leftY, rightY) + 15;

  // ======================================================
  // APPOINTMENT DETAILS
  // ======================================================
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Appointment Details", 20, cursorY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Appointment Date: ${new Date(appt.from_datetime).toLocaleString()}`,
    20,
    cursorY + 8
  );

  doc.text(`Payment ID: ${paymentId}`, 20, cursorY + 16);

  // ======================================================
  // BANK DETAILS
  // ======================================================
  const bankX = 120;

  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details", bankX, cursorY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text("Account Name: Subaa Care", bankX, cursorY + 8);
  doc.text("Account Number: XXXXXXXX", bankX, cursorY + 16);
  doc.text("Bank: Indian Overseas Bank", bankX, cursorY + 24);
  doc.text("IFSC: XXXXXXXX", bankX, cursorY + 32);

  // ======================================================
  // TABLE START
  // ======================================================
  cursorY += 55;

  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");

  doc.text("Description", 20, cursorY);
  doc.text("Rate", 130, cursorY);
  doc.text("Amount", 180, cursorY, { align: "right" });

  doc.line(20, cursorY + 2, 190, cursorY + 2);

  cursorY += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Consultation fee for ${professionalName}`,
    20,
    cursorY
  );

  doc.text(`${amount}`, 130, cursorY);
  doc.text(`${amount}`, 180, cursorY, { align: "right" });

  // ======================================================
  // TAXES + TOTAL
  // ======================================================
  cursorY += 18;

  doc.text("CGST (0%)", 130, cursorY);
  doc.text("0", 180, cursorY, { align: "right" });

  doc.text("SGST (0%)", 130, cursorY + 8);
  doc.text("0", 180, cursorY + 8, { align: "right" });

  doc.text("Round Off", 130, cursorY + 16);
  doc.text("0", 180, cursorY + 16, { align: "right" });

  cursorY += 28;

  doc.setFont("helvetica", "bold");
  doc.text("Total (INR)", 130, cursorY);
  doc.text(`₹ ${amount}`, 180, cursorY, { align: "right" });

  // ======================================================
  // TERMS
  // ======================================================
  cursorY += 20;

  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions", 20, cursorY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    "1. Please quote invoice number when remitting funds.",
    20,
    cursorY + 8
  );

  // ======================================================
  // FOOTER
  // ======================================================
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");

  doc.text(
    "This is an electronically generated document. No signature required.",
    pageWidth / 2,
    280,
    { align: "center" }
  );

  doc.save(`Payment_Invoice_${appt.id}.pdf`);
};

export default generatePaymentInvoice;