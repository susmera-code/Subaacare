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

  const amount =
    appt.amount ||
    appt.fee ||
    500;

  const paymentId =
    appt.razorpay_payment_id || "-";

  // ---------------- HEADER ----------------

  // Purple color
  doc.setTextColor(128, 0, 128);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");

  // INVOICE on LEFT
  doc.text("INVOICE", 20, 20);

  // Reset text color to black
  doc.setTextColor(0, 0, 0);

  // 🔽 smaller logo + better spacing
  const logoWidth = 35;   // reduced from 45
  const logoHeight = 18;  // reduced from 25

  const logoX = pageWidth - logoWidth - 20;
  const logoY = 10;

  doc.addImage(
    logo,
    "PNG",
    logoX,
    logoY,
    logoWidth,
    logoHeight
  );

  // Invoice metadata (moved down slightly to avoid overlap)
  doc.setFontSize(10);

  doc.text(`Invoice No: PAY-${appt.id}`, 20, 35);

  // 🔽 move date below logo properly
  doc.text(
    `Invoice Date: ${new Date().toLocaleDateString()}`,
    logoX,
    logoY + logoHeight + 8
  );

  // line stays same
  doc.line(20, 42, 190, 42);

  // ---------------- BILLED To ----------------
  // Professional / Clinic
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To", 20, 50);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Name: ${professionalName}`,
    20,
    58
  );

  doc.text(
    "Email: support@subaa.in",
    20,
    66
  );

  doc.text(
    "Phone: +91 97397 97720",
    20,
    74
  );

  // ---------------- BILLED By ----------------
  // Patient
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Billed By", 120, 50);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Name: ${patientName}`,
    120,
    58
  );

  // ---------------- APPOINTMENT INFO + BANK DETAILS (SIDE BY SIDE) ----------------

  const infoY = 90;

  // LEFT: APPOINTMENT DETAILS
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Appointment Details", 20, infoY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Appointment Date: ${new Date(appt.from_datetime).toLocaleString()}`,
    20,
    infoY + 8
  );

  doc.text(
    `Payment ID: ${paymentId}`,
    20,
    infoY + 16
  );

  // RIGHT: BANK DETAILS
  const rightX = 120;

  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details", rightX, infoY);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text("Account Name: Subaa Care", rightX, infoY + 8);
  doc.text("Account Number: XXXXXXXX", rightX, infoY + 16);
  doc.text("Bank: Indian Overseas Bank", rightX, infoY + 24);
  doc.text("IFSC: XXXXXXXX", rightX, infoY + 32);
  const sectionBottom = infoY + 45; // end of bank/appointment block
  const spacingAfterSection = 15;


  // ---------------- TABLE HEADER ----------------

  const tableTop = sectionBottom + spacingAfterSection;
  doc.setTextColor(128, 0, 128);
  doc.setFont("helvetica", "bold");

  doc.text("Description", 20, tableTop);

  doc.text("Rate", 130, tableTop);

  doc.text(
    "Amount",
    180,
    tableTop,
    { align: "right" }
  );

  doc.line(
    20,
    tableTop + 2,
    190,
    tableTop + 2
  );

  // ---------------- TABLE ROW ----------------

  const rowY = tableTop + 12;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Consultation fee for ${professionalName}`,
    20,
    rowY
  );

  doc.text(
    `${amount}`,
    130,
    rowY
  );

  doc.text(
    `${amount}`,
    180,
    rowY,
    { align: "right" }
  );

  doc.line(
    20,
    rowY + 5,
    190,
    rowY + 5
  );

  // ---------------- TAXES ----------------

  const taxY = rowY + 18;

  doc.setFont("helvetica", "normal");

  doc.text(
    "CGST (0%)",
    130,
    taxY
  );

  doc.text(
    "0",
    180,
    taxY,
    { align: "right" }
  );

  doc.text(
    "SGST (0%)",
    130,
    taxY + 8
  );

  doc.text(
    "0",
    180,
    taxY + 8,
    { align: "right" }
  );

  doc.text(
    "Round Off",
    130,
    taxY + 16
  );

  doc.text(
    "0",
    180,
    taxY + 16,
    { align: "right" }
  );

  // ---------------- TOTAL ----------------

  const totalY = taxY + 28;

  doc.setFont("helvetica", "bold");

  doc.text(
    "Total (INR)",
    130,
    totalY
  );

  doc.text(
    `₹ ${amount}`,
    180,
    totalY,
    { align: "right" }
  );

// ---------------- TERMS & CONDITIONS ----------------

const termsY = totalY + 18;

doc.setTextColor(128, 0, 128);
doc.setFont("helvetica", "bold");

doc.text("Terms and Conditions", 20, termsY);

doc.setTextColor(0, 0, 0);
doc.setFont("helvetica", "normal");

doc.text(
  "1. Please quote invoice number when remitting funds.",
  20,
  termsY + 8
);
  // ---------------- FOOTER ----------------

  doc.setFontSize(9);

  doc.setFont("helvetica", "italic");

  doc.text(
    "This is an electronically generated document. No signature required.",
    pageWidth / 2,
    280,
    { align: "center" }
  );

  // ---------------- SAVE ----------------

  doc.save(
    `Payment_Invoice_${appt.id}.pdf`
  );
};

export default generatePaymentInvoice;