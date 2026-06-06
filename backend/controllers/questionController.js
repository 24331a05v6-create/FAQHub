const Question = require("../models/Question");

const createQuestion = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    const question = await Question.create({
      title,
      description,
      category,
      tags: tags || [],
      author: req.user._id,
    });
    await question.populate("author", "name email avatar");
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    filter.isPrimary = true;

    const questions = await Question.find(filter)
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "name email avatar")
      .populate({
        path: "clusterId",
        populate: { path: "author", select: "name email avatar" },
      });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    next(error);
  }
};

const getRelatedQuestions = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    const related = await Question.find({
      _id: { $ne: question._id },
      category: question.category,
      isPrimary: true,
    })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate("author", "name avatar");
    res.json(related);
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuestion, getQuestions, getQuestionById, getRelatedQuestions };
