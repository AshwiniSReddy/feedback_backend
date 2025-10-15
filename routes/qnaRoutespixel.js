// routes/qnaRoutes.js
const express = require('express');
const router = express.Router();
const QnA = require('../models/feedbackpixelmodel')

// 🧠 POST: Add a new QnA
router.post('/', async (req, res) => {
  try {
    const { question, answer } = req.body;
     console.log(req.body)
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required.' });
    }

    const newQnA = new QnA({ question, answer });
    await newQnA.save();

    res.status(201).json({ message: 'QnA saved successfully!', data: newQnA });
  } catch (error) {
    console.error('Error saving QnA:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 📋 GET: Fetch all QnAs
router.get('/', async (req, res) => {
  try {
    const qnas = await QnA.find();
    res.status(200).json(qnas);
  } catch (error) {
    console.error('Error fetching QnAs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
