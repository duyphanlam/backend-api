const nodemailer = require("nodemailer");

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    console.log("DEBUG sendEmail params:", {
      sendTo,
      subject,
      htmlLength: html ? html.length : 0,
    });

    // Tạo transporter với App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail của bạn
        pass: process.env.EMAIL_PASS, // App Password (16 ký tự)
      },
    });

    const mailOptions = {
      from: {
        name: "Hỗ trợ khách hàng",
        address: process.env.EMAIL_USER,
      },
      to: sendTo,
      subject: subject,
      html: html,
    };

    console.log("📧 Sending email with App Password...");
    console.log(`From: ${process.env.EMAIL_USER}`);
    console.log(`To: ${sendTo}`);
    console.log(`Subject: ${subject}`);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ sendEmail failed:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
