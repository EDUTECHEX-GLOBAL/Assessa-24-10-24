const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this to another service like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL, // Use your email address from .env file
    pass: process.env.EMAIL_PASSWORD, // Use your app password from .env
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // Sender address
      to, // Recipient address
      subject, // Subject line
      text, // Plain text body
    });
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
