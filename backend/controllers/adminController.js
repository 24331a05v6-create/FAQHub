const Question = require("../models/Question");
const Answer = require("../models/Answer");
const FAQ = require("../models/FAQ");
const User = require("../models/User");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const groupQueries = async (req, res, next) => {
  try {
    const { questionIds } = req.body;
    if (!questionIds || questionIds.length < 2) {
      return res
        .status(400)
        .json({ message: "At least 2 question IDs required" });
    }

    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length < 2) {
      return res
        .status(400)
        .json({ message: "Invalid question IDs provided" });
    }

    const clusterId = new mongoose.Types.ObjectId();
    const primaryId = questionIds[0];

    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $set: { clusterId } }
    );

    await Question.findByIdAndUpdate(primaryId, { isPrimary: true });
    await Question.updateMany(
      { _id: { $in: questionIds.slice(1) } },
      { $set: { isPrimary: false } }
    );

    for (const q of questions) {
      if (!q.isPrimary || q._id.toString() === primaryId) {
        await Notification.create({
          user: q.author,
          message: `Your question "${q.title}" has been grouped with similar queries.`,
          type: "info",
          link: `/community-qa?question=${primaryId}`,
        });
      }
    }

    res.json({ message: "Queries grouped successfully", clusterId, primaryId });
  } catch (error) {
    next(error);
  }
};

const approveAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.answerId).populate("question");
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    answer.isApproved = true;
    await answer.save();

    const primaryQuestion = await Question.findById(answer.question);
    if (primaryQuestion) {
      primaryQuestion.status = "resolved";
      await primaryQuestion.save();

      await Question.updateMany(
        { clusterId: primaryQuestion.clusterId, _id: { $ne: primaryQuestion._id } },
        { $set: { status: "resolved" } }
      );

      const maxFaq = await FAQ.findOne().sort({ faqNumber: -1 }).select("faqNumber");
      await FAQ.create({
        question: primaryQuestion.title,
        answer: answer.content,
        category: primaryQuestion.category,
        tags: primaryQuestion.tags,
        faqNumber: (maxFaq?.faqNumber || 0) + 1,
      });

      await Notification.create({
        user: answer.author,
        message: "Your answer has been approved and published to FAQs!",
        type: "success",
        link: `/faq`,
      });

      await Notification.create({
        user: primaryQuestion.author,
        message: `Your question "${primaryQuestion.title}" has been resolved!`,
        type: "success",
        link: `/community-qa?question=${primaryQuestion._id}`,
      });
    }

    res.json({ message: "Answer approved and published to FAQs", answer });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const totalFAQs = await FAQ.countDocuments();
    const pendingQuestions = await Question.countDocuments({ status: "pending" });
    const resolvedQuestions = await Question.countDocuments({ status: "resolved" });

    const categoryDistribution = await FAQ.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const topQuestions = await Question.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name");

    const recentFAQs = await FAQ.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalFAQs,
      pendingQuestions,
      resolvedQuestions,
      categoryDistribution,
      topQuestions,
      recentFAQs,
    });
  } catch (error) {
    next(error);
  }
};

const getAllQuestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const questions = await Question.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Question.countDocuments();
    res.json({ questions, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    await Answer.deleteMany({ question: question._id });
    res.json({ message: "Question and associated answers deleted" });
  } catch (error) {
    next(error);
  }
};

const deleteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.json({ message: "Answer deleted" });
  } catch (error) {
    next(error);
  }
};

const manageFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 }).limit(50);
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "FAQ deleted" });
  } catch (error) {
    next(error);
  }
};

const getPriorityFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ isPinned: -1, pinnedOrder: 1, views: -1 }).limit(50);
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
    faq.pinnedOrder = faq.isPinned ? Date.now() : 0;
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

const promoteToAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.json({ message: "User is already an admin", user });
    user.role = "admin";
    await user.save();
    res.json({ message: `User ${email} promoted to admin`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const addFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, tags, iconName } = req.body;
    if (!question || !answer || !category) {
      return res.status(400).json({ message: "Question, answer, and category are required" });
    }
    const maxFaq = await FAQ.findOne().sort({ faqNumber: -1 }).select("faqNumber");
    const faq = await FAQ.create({
      question,
      answer,
      category,
      tags: tags || [],
      iconName: iconName || "",
      faqNumber: (maxFaq?.faqNumber || 0) + 1,
    });
    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  groupQueries,
  approveAnswer,
  getAnalytics,
  getAllQuestions,
  deleteQuestion,
  deleteAnswer,
  manageFAQs,
  deleteFAQ,
  addFAQ,
  getPriorityFAQs,
  togglePinFAQ,
  getTrendingFAQs,
  promoteToAdmin,
};
