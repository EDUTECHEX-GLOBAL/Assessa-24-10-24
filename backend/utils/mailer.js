const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 1. Keep your original OTP function as the default export
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

// 2. Add new functions for approval/rejection
sendEmail.sendApprovalEmail = async (to, name, role) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: "Your Account Has Been Approved",
      text: `Dear ${name},\nYour ${role} account has been approved.`,
      html: `<p>Dear ${name},<br>Your ${role} account has been approved.</p>`
    });
  } catch (error) {
    console.error("Error sending approval email: ", error);
    throw error;
  }
};

sendEmail.sendRejectionEmail = async (to, name, reason) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: "Your Account Request Has Been Rejected",
      text: `Dear ${name},\nYour account was rejected. Reason: ${reason}`,
      html: `<p>Dear ${name},<br>Your account was rejected.<br>Reason: ${reason}</p>`
    });
  } catch (error) {
    console.error("Error sending rejection email: ", error);
    throw error;
  }
};

module.exports = sendEmail; // Maintains backward compatibility