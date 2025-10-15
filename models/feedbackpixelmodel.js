const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    // Store all answers together as a key-value object
    answer: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedbackpixel", feedbackSchema);
