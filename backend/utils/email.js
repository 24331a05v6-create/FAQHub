const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"FAQHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP for FAQHub Registration",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; background: #6366f1; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h1 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0;">Verify your email</h1>
          <p style="font-size: 14px; color: #64748b; margin: 8px 0 0;">Use the OTP below to complete your FAQHub registration.</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">One-Time Password</p>
          <div style="font-size: 36px; font-weight: 800; color: #6366f1; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
          <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0;">This code expires in 10 minutes.</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
