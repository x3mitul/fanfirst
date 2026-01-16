// FanIQ Arena - Gemini AI Quiz Question Generator
// Generates personalized artist-specific quiz questions

interface QuizQuestionGenerated {
  question: string;
  type: 'multiple_choice' | 'fill_blank' | 'order' | 'visual' | 'creative';
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

interface GenerateQuestionsParams {
  artistName: string;
  count?: number;
  includeCreative?: boolean;
}

const QUIZ_SYSTEM_PROMPT = `You are a music trivia expert creating quiz questions for FanIQ Arena, a fan knowledge verification system.

Your questions should:
1. Test genuine fan knowledge (not easily googled)
2. Cover various aspects: albums, lyrics, concerts, personal facts, music videos
3. Be challenging but fair
4. Include one "creative" type question that requires subjective judgment

IMPORTANT: Generate questions that real fans would know but casual listeners or bots would struggle with.`;

const QUIZ_GENERATION_PROMPT = (artistName: string, count: number) => `
Generate ${count} quiz questions about ${artistName}.

Question Categories to include:
- Album/discography trivia (release dates, track listings, collaborations)
- Lyrics (fill in the blank from popular songs)
- Concert/tour history (memorable moments, venues, tour names)
- Chronological ordering (albums, singles, events)
- Visual recognition descriptions (album covers, outfits, stage designs)
- Personal facts (real name, hometown, career milestones)

For the LAST question, make it a "creative" type that requires subjective human judgment.
Examples of creative questions:
- "Which lyric best captures the feeling of heartbreak?"
- "Which album artwork is the most iconic?"
- "Select the most emotional live performance moment"

Return a JSON array with exactly ${count} objects in this format:
[
  {
    "question": "Question text here",
    "type": "multiple_choice",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "difficulty": "medium"
  }
]

Types can be: "multiple_choice", "fill_blank", "order", "creative"
Difficulty can be: "easy", "medium", "hard"

For "fill_blank" type: the question should have _____ where the blank is, and options are possible answers.
For "order" type: options should be items to arrange chronologically, correctAnswer is the correct order as comma-separated string.
For "creative" type: all options are potentially valid, correctAnswer is the most common/popular choice.
`;

// Cache for generated questions (24hr TTL in production)
const questionCache = new Map<string, { questions: QuizQuestionGenerated[]; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function generateQuizQuestions(
  params: GenerateQuestionsParams
): Promise<QuizQuestionGenerated[]> {
  const { artistName, count = 10, includeCreative = true } = params;
  
  // Check cache first
  const cacheKey = `${artistName.toLowerCase()}-${count}`;
  const cached = questionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Gemini] Using cached questions for ${artistName}`);
    return shuffleArray(cached.questions);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] No API key found, using fallback questions');
    return getFallbackQuestions(artistName, count);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: QUIZ_SYSTEM_PROMPT },
                { text: QUIZ_GENERATION_PROMPT(artistName, count) }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 4096,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error('No content in Gemini response');
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const questions: QuizQuestionGenerated[] = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize questions
    const validatedQuestions = questions
      .filter(q => q.question && q.options && q.correctAnswer)
      .map((q, index) => ({
        ...q,
        type: q.type || 'multiple_choice',
        difficulty: q.difficulty || 'medium',
        options: q.options.slice(0, 4), // Max 4 options
      }));

    // Cache the questions
    questionCache.set(cacheKey, {
      questions: validatedQuestions,
      timestamp: Date.now()
    });

    console.log(`[Gemini] Generated ${validatedQuestions.length} questions for ${artistName}`);
    return shuffleArray(validatedQuestions);

  } catch (error) {
    console.error('[Gemini] Error generating questions:', error);
    return getFallbackQuestions(artistName, count);
  }
}

// Fallback questions when Gemini is unavailable
function getFallbackQuestions(artistName: string, count: number): QuizQuestionGenerated[] {
  const templates: QuizQuestionGenerated[] = [
    {
      question: `What year did ${artistName} release their debut album?`,
      type: 'multiple_choice',
      options: ['2015', '2016', '2017', '2018'],
      correctAnswer: '2016',
      difficulty: 'medium'
    },
    {
      question: `Complete the lyric: "I've been _____ all night"`,
      type: 'fill_blank',
      options: ['running', 'dancing', 'thinking', 'waiting'],
      correctAnswer: 'dancing',
      difficulty: 'easy'
    },
    {
      question: `Which city hosted ${artistName}'s largest concert to date?`,
      type: 'multiple_choice',
      options: ['New York', 'Los Angeles', 'London', 'Tokyo'],
      correctAnswer: 'Los Angeles',
      difficulty: 'hard'
    },
    {
      question: `Arrange these albums in release order (earliest to latest):`,
      type: 'order',
      options: ['Album One', 'Album Two', 'Album Three', 'Album Four'],
      correctAnswer: 'Album One,Album Two,Album Three,Album Four',
      difficulty: 'medium'
    },
    {
      question: `What is ${artistName}'s real first name?`,
      type: 'multiple_choice',
      options: ['Michael', 'James', 'David', 'Robert'],
      correctAnswer: 'Michael',
      difficulty: 'medium'
    },
    {
      question: `Which song features the collaboration with the most artists?`,
      type: 'multiple_choice',
      options: ['Track A', 'Track B', 'Track C', 'Track D'],
      correctAnswer: 'Track B',
      difficulty: 'hard'
    },
    {
      question: `What genre best describes ${artistName}'s earlier work?`,
      type: 'multiple_choice',
      options: ['Hip-Hop', 'Pop', 'R&B', 'Rock'],
      correctAnswer: 'Hip-Hop',
      difficulty: 'easy'
    },
    {
      question: `Which award show featured ${artistName}'s most iconic performance?`,
      type: 'multiple_choice',
      options: ['VMAs', 'Grammys', 'BET Awards', 'AMAs'],
      correctAnswer: 'VMAs',
      difficulty: 'medium'
    },
    {
      question: `How many studio albums has ${artistName} released?`,
      type: 'multiple_choice',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      difficulty: 'medium'
    },
    {
      question: `Which lyric captures ${artistName}'s artistic vision best? (Fan opinion)`,
      type: 'creative',
      options: [
        '"Dreams are worth chasing"',
        '"The night is young"',
        '"We rise together"',
        '"Against all odds"'
      ],
      correctAnswer: '"We rise together"',
      difficulty: 'medium'
    }
  ];

  return shuffleArray(templates).slice(0, count);
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calculate quiz scores using the multi-factor formula
export function calculateQuizScore(params: {
  correctAnswers: number;
  totalQuestions: number;
  responseTimes: number[]; // in milliseconds
}): {
  finalScore: number;
  accuracyScore: number;
  speedScore: number;
  consistencyScore: number;
  avgResponseTime: number;
  responseTimeStdDev: number;
} {
  const { correctAnswers, totalQuestions, responseTimes } = params;

  // Accuracy: 0-100
  const accuracyScore = (correctAnswers / totalQuestions) * 100;

  // Speed: Based on average response time (faster = higher score)
  // Cap at 2 seconds minimum to prevent instant-click bots
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 5000;
  const clampedAvg = Math.max(avgResponseTime, 2000); // Min 2 seconds
  const speedScore = Math.max(0, 100 - ((clampedAvg - 2000) / 50)); // Scale: 2s = 100, 7s = 0

  // Consistency: Lower standard deviation = higher score
  const responseTimeStdDev = calculateStdDev(responseTimes);
  // Bots have very low stddev (consistent timing), humans vary
  // Penalize both extremes: too consistent (bot-like) or too erratic
  const idealStdDev = 800; // ms - natural human variation
  const stdDevDiff = Math.abs(responseTimeStdDev - idealStdDev);
  const consistencyScore = Math.max(0, 100 - (stdDevDiff / 20));

  // Final weighted score
  const finalScore = 
    (accuracyScore * 0.5) + 
    (speedScore * 0.3) + 
    (consistencyScore * 0.2);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    accuracyScore: Math.round(accuracyScore * 100) / 100,
    speedScore: Math.round(speedScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    avgResponseTime: Math.round(avgResponseTime),
    responseTimeStdDev: Math.round(responseTimeStdDev),
  };
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

// Calculate Fandom Score bonus from quiz
export function calculateFandomBonus(params: {
  correctAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  isPerfectRound: boolean;
}): number {
  const { correctAnswers, maxStreak, isPerfectRound } = params;
  
  let bonus = 0;
  
  // +5 points per correct answer
  bonus += correctAnswers * 5;
  
  // +10 bonus for perfect round
  if (isPerfectRound) {
    bonus += 10;
  }
  
  // Streak multiplier (max 2x)
  const streakMultiplier = Math.min(1 + (maxStreak * 0.1), 2);
  bonus = Math.round(bonus * streakMultiplier);
  
  // Daily cap of 50 points
  return Math.min(bonus, 50);
}

export type { QuizQuestionGenerated, GenerateQuestionsParams };
