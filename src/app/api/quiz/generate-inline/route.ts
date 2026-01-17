import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fallback questions in case API fails
const fallbackQuestions = {
    'LA Lakers': [
        { question: "Complete the Lakers' famous chant: 'Beat ___!'", options: ['LA', 'Boston', 'Chicago', 'Miami'], correctAnswer: 'Boston', difficulty: 'easy', type: 'fill_blank' },
        { question: "Which legendary player wore #24 for the Lakers?", options: ['Magic Johnson', 'Kobe Bryant', 'Shaquille ONeal', 'LeBron James'], correctAnswer: 'Kobe Bryant', difficulty: 'easy', type: 'player' },
        { question: "How many NBA Championships have the Lakers won?", options: ['12', '15', '17', '20'], correctAnswer: '17', difficulty: 'medium', type: 'achievement' },
        { question: "Who said: 'I'm going to take my talents to...' when joining the Lakers?", options: ['LeBron James', 'Anthony Davis', 'Russell Westbrook', 'Pau Gasol'], correctAnswer: 'LeBron James', difficulty: 'medium', type: 'quote' },
        { question: "In what year did the Lakers move from Minneapolis to Los Angeles?", options: ['1958', '1960', '1962', '1965'], correctAnswer: '1960', difficulty: 'hard', type: 'history' }
    ],
    'default': [
        { question: "What is the most common jersey number for star players?", options: ['23', '7', '10', '24'], correctAnswer: '23', difficulty: 'easy', type: 'general' },
        { question: "Which arena is known as 'The Mecca' of basketball?", options: ['Staples Center', 'Madison Square Garden', 'TD Garden', 'United Center'], correctAnswer: 'Madison Square Garden', difficulty: 'easy', type: 'venue' },
        { question: "What does MVP stand for?", options: ['Most Valuable Player', 'Most Versatile Player', 'Major Victory Prize', 'Maximum Value Performance'], correctAnswer: 'Most Valuable Player', difficulty: 'medium', type: 'general' },
        { question: "Complete: 'Ball is ___'", options: ['Life', 'Love', 'Everything', 'Power'], correctAnswer: 'Life', difficulty: 'medium', type: 'fill_blank' },
        { question: "Which trophy is awarded to NBA Finals champions?", options: ['Larry OBrien Trophy', 'Vince Lombardi Trophy', 'Stanley Cup', 'Commissioner Trophy'], correctAnswer: 'Larry OBrien Trophy', difficulty: 'hard', type: 'achievement' }
    ]
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { artistName } = await req.json();

        if (!artistName) {
            return NextResponse.json({ error: 'Artist name required' }, { status: 400 });
        }

        // Try Gemini API first
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `Generate 5 trivia questions about "${artistName}" (could be a music artist, sports team, or band).

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just pure JSON.

Requirements:
1. Questions should progressively get harder (1-2 easy, 2-3 medium, 1-2 hard)
2. Question types should include:
   - Fill in the blank (lyrics or famous quotes)
   - Member/player names
   - Famous songs/albums/achievements
3. Each question must have exactly 4 options
4. One option must be the correct answer

Return this exact JSON structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option exactly as written in options",
      "difficulty": "easy|medium|hard",
      "type": "fill_blank|player|achievement|quote|history"
    }
  ]
}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Clean the response - remove any markdown formatting
            const cleanedResponse = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const parsed = JSON.parse(cleanedResponse);

            if (parsed.questions && parsed.questions.length === 5) {
                return NextResponse.json({
                    questions: parsed.questions,
                    source: 'gemini'
                });
            }

            throw new Error('Invalid response format');
        } catch (apiError) {
            console.error('Gemini API error, using fallback:', apiError);

            // Use fallback questions
            const questions = fallbackQuestions[artistName as keyof typeof fallbackQuestions]
                || fallbackQuestions['default'];

            return NextResponse.json({
                questions,
                source: 'fallback'
            });
        }
    } catch (error) {
        console.error('Quiz generate error:', error);

        // Ultimate fallback
        return NextResponse.json({
            questions: fallbackQuestions['default'],
            source: 'fallback'
        });
    }
}
