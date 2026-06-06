const Credential = require("../models/Credential");
const User = require("../models/User");
const FAQ = require("../models/FAQ");

const issueCredential = async (req, res, next) => {
  try {
    const { email, role, duration, reason } = req.body;
    if (!email || !role) return res.status(400).json({ message: "Email and role required" });

    let expiresAt = null;
    if (duration && duration !== "permanent") {
      const map = { "7d": 7, "30d": 30, "90d": 90 };
      expiresAt = new Date(Date.now() + (map[duration] || 30) * 24 * 60 * 60 * 1000);
    }

    const user = await User.findOne({ email });
    const credential = await Credential.create({
      email,
      userId: user?._id || null,
      role,
      grantedBy: req.user._id,
      reason: reason || "",
      expiresAt,
    });

    res.status(201).json(credential);
  } catch (error) {
    next(error);
  }
};

const revokeCredential = async (req, res, next) => {
  try {
    const credential = await Credential.findByIdAndUpdate(
      req.params.id,
      { isActive: false, revokedAt: new Date() },
      { new: true }
    );
    if (!credential) return res.status(404).json({ message: "Credential not found" });
    res.json({ message: "Credential revoked", credential });
  } catch (error) {
    next(error);
  }
};

const listCredentials = async (req, res, next) => {
  try {
    const credentials = await Credential.find().sort({ createdAt: -1 }).populate("grantedBy", "name email");
    res.json(credentials);
  } catch (error) {
    next(error);
  }
};

const getPriorityFAQs = async (req, res, next) => {
  try {
    const { period } = req.query;
    const faqs = await FAQ.find()
      .sort({ isPinned: -1, pinnedOrder: 1, views: -1, trendingScore: -1 })
      .limit(50);
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

const togglePinFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    faq.isPinned = !faq.isPinned;
    if (faq.isPinned) faq.pinnedOrder = Date.now();
    else faq.pinnedOrder = 0;
    await faq.save();
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

const getTrendingFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ trendingScore: -1, views: -1 }).limit(10);
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

module.exports = { issueCredential, revokeCredential, listCredentials, getPriorityFAQs, togglePinFAQ, getTrendingFAQs };
