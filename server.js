const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/analyze', async (req, res) => {
  const { message, subject, level } = req.body;
  const prompt = `A student is studying ${subject} at ${level} level. They said: "${message}". Detect their emotion and help them. You MUST respond with ONLY this JSON object, no other text: {"emotion":"confused","emoji":"😕","emotionMessage":"I understand how you feel","teaching":"Here is my explanation","tip":"Here is my tip"}`;
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDFLnZnUXJ1J0Pow9q4-PiCWvugkHkLZuo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    });
    const data = await response.json();
    console.log('FULL RESPONSE:', JSON.stringify(data));
    
    if (!data.candidates) {
      return res.json({ emotion: 'confused', emoji: '😕', emotionMessage: 'Let me help you!', teaching: JSON.stringify(data), tip: 'Try again!' });
    }
    
    const text = data.candidates[0].content.parts[0].text;
    console.log('TEXT:', text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ emotion: 'confused', emoji: '😕', emotionMessage: 'I understand!', teaching: text, tip: 'Keep going!' });
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    res.json({
      emotion: parsed.emotion || 'confused',
      emoji: parsed.emoji || '😕',
      emotionMessage: parsed.emotionMessage || 'I understand how you feel!',
      teaching: parsed.teaching || 'Let me help you with this.',
      tip: parsed.tip || 'Keep going!'
    });
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));