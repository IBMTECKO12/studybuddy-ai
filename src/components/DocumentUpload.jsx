import { useState, useEffect } from 'react';
import { generateContent } from '../services/gemini';
import LoadingSpinner from './LoadingSpinner';
import mammoth from 'mammoth';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

export default function DocumentUpload({ onContentGenerated }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPdfReady, setIsPdfReady] = useState(false);

  // Initialize PDF.js worker
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    setIsPdfReady(true);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a .txt, .pdf, or .docx file");
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const extractText = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    if (file.type === 'application/pdf' && !isPdfReady) {
      setError("PDF processor is still initializing");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let extractedText = '';
      
      if (file.type === 'text/plain') {
        // Plain text file
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        // PDF file
        extractedText = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOCX file
        extractedText = await extractTextFromDOCX(file);
      }

      setText(extractedText);
    } catch (err) {
      setError("Failed to extract text from file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // PDF text extraction
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  // DOCX text extraction using mammoth.js
  const extractTextFromDOCX = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };
  
const generateFlashcards = async () => {
    if (!text.trim()) {
      setError("Please extract text first");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const flashcards = await generateContent("", text, "flashcards");
      onContentGenerated("flashcards", JSON.parse(flashcards));
    } catch (err) {
      setError("Failed to generate flashcards");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!text.trim()) {
      setError("Please extract text first");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const summary = await generateContent("", text, "summary");
      onContentGenerated("summary", summary);
    } catch (err) {
      setError("Failed to generate summary");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  // Generate quiz from document content
  const generateQuizFromDocument = async () => {
  if (!text.trim()) {
    setError("Please extract text first");
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    // Smart truncation for better results
    const content = text.length > 15000 
      ? text.substring(0, 15000) + "\n[Content truncated for quiz generation...]"
      : text;

    const prompt = `Generate a quiz with exactly 10 multiple-choice questions in valid JSON format based EXCLUSIVELY on the provided content.
Follow these requirements STRICTLY:

1. OUTPUT FORMAT:
   - Only output a JSON array of question objects
   - No additional text, explanations, or markdown

2. QUESTION REQUIREMENTS:
   - Each question must DIRECTLY relate to key facts from the content
   - Questions should test important knowledge from the content
   - Avoid trivial or obvious questions

3. QUESTION STRUCTURE:
   {
     "question": "clear question phrasing",
     "options": ["4 plausible distractors", "with only one", "correct answer", "matching content"],
     "correctAnswer": "must exactly match one option"
   }

4. VALIDATION RULES:
   - All questions must be answerable using ONLY the provided content
   - Correct answers must be unambiguous facts from the content
   - Distractors should be related but incorrect

5. CONTENT FOCUS:
   - Prioritize questions about:
     * Key definitions and terms
     * Important processes or sequences
     * Crucial relationships or cause-effect
     * Significant numbers/dates (if applicable)

Content: ${content}

REMINDER: If any part of the content is unclear for quiz questions, omit rather than guess.
`;

    const quiz = await generateContent(prompt, "", "quiz");
    const parsedQuiz = JSON.parse(quiz);
    onContentGenerated("quiz", parsedQuiz);
  } catch (err) {
    setError("Failed to generate quiz from document");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Study Material (TXT, PDF, DOCX)
          </label>
          <input
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isLoading}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {file && (
          <div className="space-y-4">
            <button
              onClick={extractText}
              disabled={isLoading || (file.type === 'application/pdf' && !isPdfReady)}
              className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" className="mr-2" />
                  Extracting...
                </div>
              ) : (
                'Extract Text'
              )}
            </button>

            {text && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Extracted Text:</h3>
                <div className="p-3 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{text.slice(0, 1000)}{text.length > 1000 ? '...' : ''}</pre>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={generateFlashcards}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    {isLoading ? 'Generating...' : 'Make Flashcards'}
                  </button>
                  <button
                    onClick={generateQuizFromDocument}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    {isLoading ? 'Generating...' : 'Generate Quiz'}
                  </button>
                  <button
                    onClick={generateSummary}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md text-white ${isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    {isLoading ? 'Generating...' : 'Summarize'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}