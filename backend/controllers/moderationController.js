const Answer = require("../models/Answer");
const Question = require("../models/Question");
const FAQ = require("../models/FAQ");
const Notification = require("../models/Notification");

const getPendingAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({ status: "pending_review", isHidden: false })
      .populate("author", "name email avatar")
      .populate({
        path: "question",
        select: "title description category author",
        populate: { path: "author", select: "name email" },
      })
      .sort({ createdAt: 1 });
    res.json(answers);
  } catch (error) {
    next(error);
  }
};

const getPendingCount = async (req, res, next) => {
  try {
    const count = await Answer.countDocuments({ status: "pending_review", isHidden: false });
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

const approveAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id).populate("question");
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    answer.status = "approved";
    answer.isApproved = true;
    answer.reviewedBy = req.user._id;
    answer.reviewedAt = new Date();
    await answer.save();

    const question = await Question.findById(answer.question);
    if (question) {
      question.status = "resolved";
      await question.save();

      await Question.updateMany(
        { clusterId: question.clusterId, _id: { $ne: question._id } },
        { $set: { status: "resolved" } }
      );

      await FAQ.create({
        question: question.title,
        answer: answer.content,
        category: question.category,
        tags: question.tags,
      });
    }

    await Notification.create({
      user: answer.author,
      message: "Your answer has been approved and published!",
      type: "success",
      link: "/faq",
    });

    res.json({ message: "Answer approved", answer });
  } catch (error) {
    next(error);
  }
};

const rejectAnswer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    answer.status = "rejected";
    answer.reviewedBy = req.user._id;
    answer.reviewedAt = new Date();
    answer.rejectionReason = reason || "Does not meet quality standards";
    answer.isHidden = true;
    await answer.save();

    await Notification.create({
      user: answer.author,
      message: `Your answer was not approved: ${answer.rejectionReason}`,
      type: "warning",
      link: "/community-qa",
    });

    res.json({ message: "Answer rejected", answer });
  } catch (error) {
    next(error);
  }
};

const requestChanges = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    answer.status = "changes_requested";
    answer.reviewedBy = req.user._id;
    answer.reviewedAt = new Date();
    answer.moderatorNotes = notes || "Please revise your answer";
    await answer.save();

    await Notification.create({
      user: answer.author,
      message: `Your answer needs changes: ${answer.moderatorNotes}`,
      type: "info",
      link: "/community-qa",
    });

    res.json({ message: "Changes requested", answer });
  } catch (error) {
    next(error);
  }
};

const getQueueStats = async (req, res, next) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      Answer.countDocuments({ status: "pending_review" }),
      Answer.countDocuments({ status: "approved" }),
      Answer.countDocuments({ status: "rejected" }),
    ]);
    res.json({ pending, approved, rejected });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingAnswers, getPendingCount, approveAnswer, rejectAnswer, requestChanges, getQueueStats };
