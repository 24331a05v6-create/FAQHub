const OTP = require("../models/OTP");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../utils/email");

const sendOTP = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error("Email send error:", emailErr.message);
      return res.status(500).json({ message: "Failed to send OTP email. Check EMAIL_APP_PASSWORD in .env" });
    }

    const masked = email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length));
    res.json({ message: `OTP sent to ${masked}` });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, name, password } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await OTP.findOne({ email, verified: false }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ message: "No OTP found. Request a new one." });
    }

    if (new Date() > record.expiresAt) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: "Too many failed attempts. Request a new OTP." });
    }

    if (record.otp !== otp) {
      await record.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    record.verified = true;
    await record.save();

    if (name && password) {
      const user = await User.create({ name, email, password });
      const token = generateToken(user._id);
      await OTP.deleteMany({ email });
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token,
      });
    }

    res.json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOTP, verifyOTP };
