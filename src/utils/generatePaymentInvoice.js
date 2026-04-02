import jsPDF from "jspdf";

const generatePaymentInvoice = (appt) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("PAYMENT INVOICE", 105, 20, null, null, "center");

  doc.setFontSize(11);
  doc.text(`Invoice No: PAY-${appt.id}`, 20, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 35);

  doc.line(20, 40, 190, 40);

  doc.text(`Professional: ${appt.professionals?.full_name}`, 20, 55);
  doc.text(`Payment ID: ${appt.razorpay_payment_id}`, 20, 65);

  doc.text(
    `From: ${new Date(appt.from_datetime).toLocaleString()}`,
    20,
    80
  );

  const amount = 500; // replace with real value

  doc.text("Description", 20, 105);
  doc.text("Amount", 160, 105);
  doc.line(20, 108, 190, 108);

  doc.text("Appointment Fee", 20, 120);
  doc.text(`₹ ${amount}`, 160, 120);

  doc.line(20, 130, 190, 130);

  doc.text("Total Paid:", 20, 140);
  doc.text(`₹ ${amount}`, 160, 140);

  doc.save(`Payment_Invoice_${appt.id}.pdf`);
};

export default generatePaymentInvoice;