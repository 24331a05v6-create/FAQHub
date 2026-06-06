const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
    feedbackRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    feedbackCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    iconName: {
      type: String,
      default: "",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedOrder: {
      type: Number,
      default: 0,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
    faqNumber: {
      type: Number,
      unique: true,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FAQ",
      default: null,
    },
  },
  { timestamps: true }
);

faqSchema.index({ question: "text", answer: "text" });
faqSchema.index({ category: 1 });
faqSchema.index({ tags: 1 });

module.exports = mongoose.model("FAQ", faqSchema);
