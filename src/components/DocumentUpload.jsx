import { useState } from "react";
import { generateContent } from "../services/gemini";

export default function DocumentUpload({ onContentGenerated }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/plain" && selectedFile.type !== "application/pdf") {
      setError("Please upload a .txt or .pdf file");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const extractText = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let extractedText = "";
      
      if (file.type === "text/plain") {
        extractedText = await file.text();
      } else if (file.type === "application/pdf") {
        // For PDFs, we'd typically use a PDF parsing library
        // This is a simplified version - in production, use something like pdf-parse
        extractedText = "PDF content extraction would go here";
      }

      setText(extractedText);
    } catch (err) {
      setError("Failed to extract text from file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!text.trim()) {
      setError("Please extract text first");
      return;
    }

    setIsLoading(true);
    setError("");

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
    setError("");

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

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Upload Study Material
        </label>
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {file && (
        <div className="space-y-4">
          <button
            onClick={extractText}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Processing..." : "Extract Text"}
          </button>

          {text && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Extracted Text:</h3>
              <div className="p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{text.slice(0, 500)}...</pre>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={generateFlashcards}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                >
                  {isLoading ? "Generating..." : "Make Flashcards"}
                </button>
                <button
                  onClick={generateSummary}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
                >
                  {isLoading ? "Generating..." : "Summarize"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}