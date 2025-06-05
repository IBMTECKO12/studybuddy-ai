import { useState } from 'react';
import { generateContent } from '../services/gemini';
import LoadingSpinner from './LoadingSpinner';

export default function QuizGenerator({ onQuizGenerated }) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateQuiz = (quiz, topic) => {
    try {
      const parsed = JSON.parse(quiz);
      
      if (!Array.isArray(parsed) || parsed.length !== 10) {
        throw new Error("Quiz must have exactly 5 questions");
      }

      const topicKeywords = topic.toLowerCase().split(/\s+/).filter(k => k.length > 2);
      let definitionQuestions = 0;
      let applicationQuestions = 0;
      
      const validated = parsed.map((q, i) => {
        // Basic structure validation
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
          throw new Error(`Question ${i+1} has invalid structure`);
        }
        
        // Verify correct answer exists in options
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(`Question ${i+1} has correct answer not in options`);
        }

        // Categorize question type
        const isDefinition = q.question.toLowerCase().includes('define') || 
                            q.question.toLowerCase().includes('what is') ||
                            q.question.toLowerCase().includes('meaning of');
        if (isDefinition) definitionQuestions++;
        else applicationQuestions++;

        // Topic relevance check
        const questionText = (q.question + ' ' + q.options.join(' ')).toLowerCase();
        const isRelevant = topicKeywords.length === 0 || 
                          topicKeywords.some(kw => questionText.includes(kw));

        if (!isRelevant) {
          throw new Error(`Question ${i+1} is not relevant to the topic`);
        }

        return q;
      });

      // Validate question type distribution
      if (definitionQuestions < 4 || applicationQuestions < 6) {
        throw new Error(`Quiz should include at least 2 definition and 3 application questions`);
      }

      return validated;
    } catch (e) {
      console.error("Validation error:", e.message);
      throw new Error(`Quiz validation failed: ${e.message}`);
    }
  };

  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const prompt = `Generate a technical quiz with exactly 10 multiple-choice questions in valid JSON format about: ${topic}

STRICT REQUIREMENTS:

1. CONTENT FOCUS:
   - Focus specifically on the key aspects of: ${topic}
   - Include exactly:
     * 4 definition questions (testing key terms)
     * 6 application questions (testing practical usage)

2. QUESTION QUALITY:
   - All questions must be directly answerable using standard knowledge of ${topic}
   - Correct answers must be explicit facts, not interpretations
   - Avoid trivial or opinion-based questions
   - Ensure all options are plausible but only one is correct

3. OUTPUT FORMAT:
   - Only output a JSON array with this exact structure:
     [{
       "question": "clear question about ${topic}",
       "options": ["array", "of", "4", "choices"],
       "correctAnswer": "exact text of correct option"
     }]
   - No additional text or markdown

4. VALIDATION:
   - Every question must contain at least one of these keywords: ${topic.toLowerCase().split(/\s+/).filter(k => k.length > 2).join(', ')}
   - Answers must be verifiable facts

Example of GOOD question:
{
  "question": "What is the primary purpose of React's useEffect hook?",
  "options": [
    "To handle component styling",
    "To perform side effects in function components",
    "To create new components",
    "To optimize rendering performance"
  ],
  "correctAnswer": "To perform side effects in function components"
}

REMEMBER:
- If unsure about accuracy, omit the question
- Prioritize depth over breadth
- Make questions challenging but fair`;

      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          const quiz = await generateContent(prompt, "", "quiz");
          const validatedQuiz = validateQuiz(quiz, topic);
          onQuizGenerated(validatedQuiz);
          return;
        } catch (err) {
          lastError = err;
          attempts++;
          console.warn(`Attempt ${attempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      throw lastError || new Error("Failed after multiple attempts");

    } catch (err) {
      setError(`Failed to generate valid quiz: ${err.message.replace('Error: ', '')}`);
      console.error("Quiz generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Quiz Generator</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="quiz-topic" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your technical topic:
          </label>
          <input
            type="text"
            id="quiz-topic"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError('');
            }}
            placeholder="e.g., React useEffect, Python decorators, CSS Grid"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific: "React useEffect cleanup" works better than just "React"
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">
            {error}
            <p className="mt-1 text-xs">Try being more specific like "React useEffect dependency array rules"</p>
          </div>
        )}

        <button
          onClick={generateQuiz}
          disabled={isLoading || !topic.trim()}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading || !topic.trim() 
              ? 'bg-blue-400' 
              : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="small" className="mr-2" />
              Generating...
            </div>
          ) : (
            'Generate Quiz'
          )}
        </button>
      </div>
    </div>
  );
}