const Answer = require("../models/Answer");
const Question = require("../models/Question");

const createAnswer = async (req, res, next) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    const answer = await Answer.create({
      content,
      question: question._id,
      author: req.user._id,
    });
    await answer.populate("author", "name email avatar");
    res.status(201).json(answer);
  } catch (error) {
    next(error);
  }
};

const getAnswers = async (req, res, next) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate("author", "name email avatar")
      .sort({ upvotes: -1, createdAt: -1 });
    res.json(answers);
  } catch (error) {
    next(error);
  }
};

const upvoteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }
    const userId = req.user._id;
    const index = answer.upvotedBy.indexOf(userId);
    if (index > -1) {
      answer.upvotedBy.splice(index, 1);
      answer.upvotes = Math.max(0, answer.upvotes - 1);
    } else {
      answer.upvotedBy.push(userId);
      answer.upvotes += 1;
    }
    await answer.save();
    res.json({ upvotes: answer.upvotes, upvotedBy: answer.upvotedBy });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAnswer, getAnswers, upvoteAnswer };
