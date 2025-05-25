import { useState, useRef, useEffect } from "react";
import { generateContent } from "../services/gemini";
import { useAuth } from "../context/AuthContext";

export default function StudyChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: "user" };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

    try {
    const response = await generateContent(input, "", "chat");
    const botMessage = { text: response, sender: "bot" };
    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    const errorMessage = { 
      text: "Sorry, I encountered an error. Please try again.", 
      sender: "bot" 
    };
    setMessages((prev) => [...prev, errorMessage]);
    console.error("Chat error:", error);
  } finally {
    setIsLoading(false);
  }
  };

  const handleQuickQuestion = async (question) => {
    setInput(question);
    // Simulate form submission
    const event = { preventDefault: () => {} };
    await handleSubmit(event);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">Ask me anything about your study material!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
              {[
                "Explain quantum physics basics",
                "What's the difference between React and Angular?",
                "Summarize the French Revolution",
                "How does photosynthesis work?"
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm text-left"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.sender === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-800"}`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        {currentUser && (
          <p className="text-xs text-gray-500 mt-2">
            Chat history is saved to your account.
          </p>
        )}
      </form>
    </div>
  );
}