const FAQ = require("../models/FAQ");

const getFAQs = async (req, res, next) => {
  try {
    const { category, tag, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const faqs = await FAQ.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FAQ.countDocuments(filter);

    res.json({
      faqs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const searchFAQs = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const results = await FAQ.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FAQ.countDocuments({ $text: { $search: q } });

    res.json({
      faqs: results,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const bookmarkFAQ = async (req, res, next) => {
  try {
    const { faqId } = req.body;
    const user = req.user;
    const faq = await FAQ.findById(faqId);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    const index = user.bookmarks.indexOf(faqId);
    if (index > -1) {
      user.bookmarks.splice(index, 1);
      faq.bookmarks = Math.max(0, faq.bookmarks - 1);
    } else {
      user.bookmarks.push(faqId);
      faq.bookmarks = (faq.bookmarks || 0) + 1;
    }
    await user.save();
    await faq.save();
    res.json({ bookmarks: user.bookmarks, faqBookmarks: faq.bookmarks });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await FAQ.distinct("category");
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const incrementView = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

const getPopularFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ views: -1, bookmarks: -1 }).limit(10);
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

const getTrendingFAQs = async (req, res, next) => {
  try {
    const mostViewed = await FAQ.find().sort({ views: -1 }).limit(10).lean();
    const mostBookmarked = await FAQ.find().sort({ bookmarks: -1 }).limit(10).lean();
    const highestTrending = await FAQ.find({ trendingScore: { $gt: 0 } }).sort({ trendingScore: -1, views: -1 }).limit(10).lean();
    const byCategory = await FAQ.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, totalViews: { $sum: "$views" } } },
      { $sort: { totalViews: -1 } },
      { $limit: 10 },
    ]);
    res.json({ mostViewed, mostBookmarked, highestTrending, byCategory });
  } catch (error) {
    next(error);
  }
};

const getRelatedFAQs = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    const related = await FAQ.find({
      _id: { $ne: faq._id },
      $or: [
        { category: faq.category },
        { tags: { $in: faq.tags } },
      ],
    })
      .limit(5)
      .sort({ views: -1 });
    res.json(related);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  searchFAQs,
  bookmarkFAQ,
  getCategories,
  incrementView,
  getPopularFAQs,
  getTrendingFAQs,
  getRelatedFAQs,
};
