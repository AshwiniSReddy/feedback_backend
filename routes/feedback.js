const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedbackmodel'); // Import the Feedback model

router.post('/', async (req, res) => {
    try {
        // Extract the questions array from the feedback property in req.body
        const { feedback } = req.body;

        // Create and save the feedback document in the database
        const savedFeedback = await Feedback.create({ questions: feedback });

        // Send a success response
        res.status(201).json({ message: 'Feedback submitted successfully', savedFeedback });
    } catch (error) {
        // Send an error response
        res.status(400).json({ message: 'Failed to submit feedback', error: error.message });
    }
});
router.get('/', async (req, res) => {
    // Example response for GET request
    res.status(200).json({ message: 'API is working' });
});


module.exports = router;
