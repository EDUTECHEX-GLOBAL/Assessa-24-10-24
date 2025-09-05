const nodemailer = require("nodemailer");

// Pick correct dashboard URL based on environment
const dashboardUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DASHBOARD_URL_PROD
    : process.env.DASHBOARD_URL_LOCAL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,           // ✅ Use EMAIL instead of EMAIL
    pass: process.env.EMAIL_PASSWORD,  // ✅ Use EMAIL_PASSWORD
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

// Notify admin when a new student signs up
sendEmail.sendAdminStudentSignupEmail = async (name, email) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,       // ✅ send from Admin
      to: process.env.EMAIL,         // ✅ send to Admin
      subject: "New Student Signup Pending Approval",
      text: `A new student has signed up:\n\nName: ${name}\nEmail: ${email}\n\nReview this request: ${dashboardUrl}/admin-dashboard/approvals`,
      html: `
        <h2>New Student Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>This student is waiting for your approval.</p>
        <p><a href="${dashboardUrl}/adminpanel-login">Review in Dashboard</a></p>
      `
    });
  } catch (error) {
    console.error("Error sending student signup notification:", error);
    throw error;
  }
};

// Notify admin when a new teacher signs up
sendEmail.sendAdminTeacherSignupEmail = async (name, email) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,       // ✅ send from Admin
      to: process.env.EMAIL,         // ✅ send to Admin
      subject: "New Teacher Signup Pending Approval",
      text: `A new teacher has signed up:\n\nName: ${name}\nEmail: ${email}\n\nReview this request: ${dashboardUrl}/admin-dashboard/approvals`,
      html: `
        <h2>New Teacher Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>This teacher is waiting for your approval.</p>
        <p><a href="${dashboardUrl}/adminpanel-login">Review in Dashboard</a></p>
      `
    });
  } catch (error) {
    console.error("Error sending teacher signup notification:", error);
    throw error;
  }
};

module.exports = sendEmail; // Maintains backward compatibility