const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Notification = require("../models/Notification");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const resolvedQuestions = await Question.countDocuments({ author: user._id, status: "resolved" });
    const totalAnswers = await Answer.countDocuments({ author: user._id });
    const approvedAnswers = await Answer.countDocuments({ author: user._id, isApproved: true });
    const unreadNotifications = await Notification.countDocuments({ user: user._id, read: false });

    res.json({
      user,
      stats: { totalQuestions, resolvedQuestions, totalAnswers, approvedAnswers, unreadNotifications },
    });
  } catch (error) {
    next(error);
  }
};

const getMyQuestions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { author: req.user._id };
    if (status) filter.status = status;

    const questions = await Question.find(filter)
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Question.countDocuments(filter);
    res.json({ questions, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getMyAnswers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const answers = await Answer.find({ author: req.user._id })
      .populate({ path: "question", select: "title status category" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Answer.countDocuments({ author: req.user._id });
    res.json({ answers, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments({ user: req.user._id });
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });

    res.json({ notifications, total, unread, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const markNotificationsRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const filter = { user: req.user._id, read: false };
    if (ids?.length) filter._id = { $in: ids };
    await Notification.updateMany(filter, { $set: { read: true } });
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, getMyQuestions, getMyAnswers, getNotifications, markNotificationsRead };
