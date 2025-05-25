import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.7,
  topP: 1,
  topK: 32,
  maxOutputTokens: 4096,
};

const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_ONLY_HIGH",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_ONLY_HIGH",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_ONLY_HIGH",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_ONLY_HIGH",
  },
];

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig,
  safetySettings, // Add safety settings
});


export const generateContent = async (prompt, content, type = "flashcards") => {
  try {
    let fullPrompt = "";
    
    switch (type) {
      case "flashcards":
        fullPrompt = `Generate 5 flashcards in JSON format from the following content. 
        Each flashcard should have a 'question' and 'answer' field. 
        Return only the JSON array without any additional text or markdown.
        Content: ${content}`;
        break;
      case "summary":
        fullPrompt = `Generate a concise summary (about 150 words) of the following content:
        ${content}`;
        break;
      case "quiz":
        fullPrompt = `Generate a quiz with 5 questions in JSON format from the following content.
        Each question should have 'question', 'options' (array), and 'correctAnswer' fields.
        Return only the JSON array without any additional text or markdown.
        Content: ${content}`;
        break;
      default:
        fullPrompt = prompt;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // For JSON responses, we need to extract the JSON from the response
    if (type === "flashcards" || type === "quiz") {
      try {
        // Gemini sometimes adds markdown or extra text, so we need to extract the JSON
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        return jsonString;
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        throw new Error("Failed to parse AI response");
      }
    }

    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};