const AdminQuery = require("../models/AdminQuery");
const Notification = require("../models/Notification");

const createAdminQuery = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const query = await AdminQuery.create({
      title,
      description,
      author: req.user._id,
    });
    await query.populate("author", "name email avatar");
    res.status(201).json(query);
  } catch (error) {
    next(error);
  }
};

const getMyAdminQueries = async (req, res, next) => {
  try {
    const queries = await AdminQuery.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    next(error);
  }
};

const getPendingAdminQueries = async (req, res, next) => {
  try {
    const queries = await AdminQuery.find({ status: "pending" })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    next(error);
  }
};

const resolveAdminQuery = async (req, res, next) => {
  try {
    const { answer } = req.body;
    const query = await AdminQuery.findById(req.params.id);
    if (!query) return res.status(404).json({ message: "Query not found" });

    query.status = "resolved";
    query.answer = answer;
    query.resolvedAt = new Date();
    await query.save();

    await Notification.create({
      user: query.author,
      message: `Your admin query "${query.title}" has been resolved.`,
      type: "success",
      link: "/raise-query",
    });

    res.json({ message: "Query resolved successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAdminQuery, getMyAdminQueries, getPendingAdminQueries, resolveAdminQuery };
