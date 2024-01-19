const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  
    questions: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true }
        }
    ],
    createdAt: { type: Date, default: Date.now } // Ensure timestamps are recorded
  
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;
