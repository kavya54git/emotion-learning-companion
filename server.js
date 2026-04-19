const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/analyze', async (req, res) => {
  const { message, subject, level } = req.body;
  const prompt = 'You are an Emotion-Aware Learning Companion. Student message: ' + message + ' Subject: ' + subject + ' Level: ' + level + ' Detect emotion (stressed/frustrated/confused/bored/happy/confident). Reply ONLY in this exact JSON format with no extra text: {"emotion":"frustrated","emoji":"😤","emotionMessage":"your message here","teaching":"your teaching here","tip":"your tip here"}';
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCGr4hcWYZNqzGgF2Zgnd24XoLau-D1GtI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data));
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (!parsed.emotion) parsed.emotion = 'confused';
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));