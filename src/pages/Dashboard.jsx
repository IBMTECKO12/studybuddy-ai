import { useState } from "react";
import DocumentUpload from "../components/DocumentUpload";
import FlashcardGenerator from "../components/FlashcardGenerator";
import StudyChatbot from "../components/StudyChatbot";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [flashcards, setFlashcards] = useState([]);
  const [summary, setSummary] = useState("");
  const { currentUser } = useAuth();

  const handleContentGenerated = (type, content) => {
    if (type === "flashcards") {
      setFlashcards(content);
      setActiveTab("flashcards");
    } else if (type === "summary") {
      setSummary(content);
      setActiveTab("summary");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">StudyBuddy AI Dashboard</h1>
      
      {currentUser ? (
        <p className="mb-4">Welcome back, {currentUser.displayName || currentUser.email}!</p>
      ) : (
        <p className="mb-4">Welcome! Sign in to save your progress.</p>
      )}

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === "upload" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Content
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "flashcards" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          onClick={() => setActiveTab("flashcards")}
          disabled={flashcards.length === 0}
        >
          Flashcards {flashcards.length > 0 && `(${flashcards.length})`}
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "summary" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          onClick={() => setActiveTab("summary")}
          disabled={!summary}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "chat" ? "border-b-2 border-blue-500 font-medium" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Study Chatbot
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "upload" && (
          <DocumentUpload onContentGenerated={handleContentGenerated} />
        )}
        {activeTab === "flashcards" && (
          <FlashcardGenerator flashcards={flashcards} />
        )}
        {activeTab === "summary" && (
          <div>
            <h2 className="text-xl font-medium mb-4">Content Summary</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{summary}</p>
            </div>
          </div>
        )}
        {activeTab === "chat" && <StudyChatbot />}
      </div>
    </div>
  );
}