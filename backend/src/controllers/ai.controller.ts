import { Request, Response } from 'express';

export const generateStory = async (req: Request, res: Response) => {
  const { words } = req.body;
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of target words.' });
  }

  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const prompt = `Write a short, engaging story (around 200 words) using the following vocabulary words naturally: ${words.join(', ')}. Highlight the target words in bold.`;
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const text = response.text();
    
    const mockStory = `Once upon a time in a small village, there was a feeling of serendipity in the air. 
The ephemeral beauty of the sunset painted the sky in shades of orange and pink. 
A wise old owl, whose presence seemed ubiquitous, watched over the townsfolk as they gathered around the fire. 
They shared tales of ancient magic, ensuring the target words like ${words.join(', ')} were well remembered by everyone. 
It was a night they would never forget.`;
    
    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({ success: true, story: mockStory });
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({ success: false, error: 'Failed to generate story with AI' });
  }
};
