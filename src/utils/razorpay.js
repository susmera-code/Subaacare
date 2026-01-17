
export function startRazorpayPayment({
  amount,
  name,
  email,
  phone,
  onSuccess,
  onFailure,
}) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: "INR",
    name: "Subaa Care",
    description: "Healthcare Service",

    handler: function (response) {
      onSuccess(response);
    },

    prefill: {
      name,
      email,
      contact: phone,
    },

    theme: {
      color: "#0d6efd",
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}
