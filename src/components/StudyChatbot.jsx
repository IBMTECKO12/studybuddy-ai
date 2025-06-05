import { useState, useRef, useEffect } from "react";
import { generateContent } from "../services/gemini";
import { useAuth } from "../context/AuthContext";
import { saveChatHistory, getChatHistory } from "../services/firebase";
import LoadingSpinner from "./LoadingSpinner";


// Component to render formatted bot messages
const BotMessage = ({ content }) => {
  const renderFormattedText = (text) => {
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, idx) => {
      // Handle bullet points
      if (para.startsWith('* ')) {
        const items = para.split('\n* ').filter(i => i);
        return (
          <ul key={idx} className="list-disc pl-5 space-y-1 my-2">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-200">
                {formatText(item.replace('* ', ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Handle numbered lists
      if (/^\d+\./.test(para)) {
        const items = para.split('\n').filter(i => i);
        return (
          <ol key={idx} className="list-decimal pl-5 space-y-1 my-2">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-200">
                {formatText(item.replace(/^\d+\.\s*/, ''))}
              </li>
            ))}
          </ol>
        );
      }

      return (
        <p key={idx} className="my-2 text-gray-700 dark:text-gray-200">
          {formatText(para)}
        </p>
      );
    });
  };

  // Format bold text (**text**) and other markdown
  const formatText = (text) => {
    const parts = [];
    let remaining = text;
    
    while (remaining) {
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        // Add text before bold
        if (boldMatch.index > 0) {
          parts.push(remaining.substring(0, boldMatch.index));
        }
        // Add bold text
        parts.push(
          <span key={parts.length} className="font-bold text-blue-600 dark:text-blue-400">
            {boldMatch[1]}
          </span>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(remaining);
        remaining = '';
      }
    }

    return parts;
  };

  return <div className="whitespace-pre-wrap">{renderFormattedText(content)}</div>;
};

export default function StudyChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsStatus, setTtsStatus] = useState("inactive"); // 'inactive', 'playing', 'paused'
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const recognitionRef = useRef(null);

    // Load chat history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      if (currentUser) {
        try {
          const history = await getChatHistory(currentUser.uid);
          if (history.length > 0) {
            setMessages(history);
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
    };
    loadHistory();
  }, [currentUser]);

  // Save chat history whenever messages change
  useEffect(() => {
    const saveHistory = async () => {
      if (currentUser && messages.length > 0) {
        try {
          await saveChatHistory(currentUser.uid, messages);
        } catch (error) {
          console.error("Failed to save chat history:", error);
        }
      }
    };
    
    const timer = setTimeout(() => {
      saveHistory();
    }, 1000); // Debounce to avoid too frequent saves

    return () => clearTimeout(timer);
  }, [messages, currentUser]);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' + transcript : transcript));
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Cleanup speech synthesis
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
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

  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setTtsStatus("playing");
    utterance.onend = () => setTtsStatus("inactive");
    utterance.onpause = () => setTtsStatus("paused");
    utterance.onresume = () => setTtsStatus("playing");
    utterance.onerror = () => setTtsStatus("inactive");
    
    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const toggleTtsPlayback = () => {
    if (!window.speechSynthesis) return;

    if (ttsStatus === "playing") {
      window.speechSynthesis.pause();
      setTtsStatus("paused");
    } else if (ttsStatus === "paused") {
      window.speechSynthesis.resume();
      setTtsStatus("playing");
    } else {
      // If not playing, find the last bot message and play it
      const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');
      if (lastBotMessage) {
        speakResponse(lastBotMessage.text);
      }
    }
  };

  const stopTts = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTtsStatus("inactive");
    }
  };

  const handleQuickQuestion = async (question) => {
    setInput(question);
    const event = { preventDefault: () => {} };
    await handleSubmit(event);
  };

   const clearHistory = async () => {
    if (currentUser) {
      try {
        await saveChatHistory(currentUser.uid, []);
        setMessages([]);
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)]">
      {/* Add history controls */}
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="text-lg font-semibold">Study Chat</h2>
        {currentUser && messages.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear History
          </button>
        )}
      </div>
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
            <div className="max-w-md">
              <p className="mb-4 text-lg font-medium">Ask me anything about your study material!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Explain quantum physics basics",
                  "What's the difference between React and Angular?",
                  "Summarize the French Revolution",
                  "How does photosynthesis work?"
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuickQuestion(question)}
                    className="p-2 sm:p-3 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm sm:text-base text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] lg:max-w-[65%] rounded-xl p-4 ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {message.sender === "bot" ? (
                  <BotMessage content={message.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-1 rounded-full ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "text-gray-500 hover:text-blue-600"
                }`}
                disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* TTS Controls */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full pl-1">
                <button
                  type="button"
                  onClick={toggleTtsPlayback}
                  className={`p-1 rounded-full ${
                    ttsStatus === "playing" ? 'bg-green-500 text-white' : 
                    ttsStatus === "paused" ? 'bg-yellow-500 text-white' : 
                    'text-gray-500 hover:text-blue-600'
                  }`}
                  title={ttsStatus === "playing" ? "Pause" : 
                        ttsStatus === "paused" ? "Resume" : "Play last response"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    {ttsStatus === "playing" ? (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>
                
                {ttsStatus !== "inactive" && (
                  <button
                    type="button"
                    onClick={stopTts}
                    className="p-1 text-gray-500 hover:text-red-600 rounded-full"
                    title="Stop"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 sm:px-5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center min-w-[80px]"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Send'}
          </button>
        </div>
        {currentUser && (
          <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
            Chat history is saved to your account.
          </p>
        )}
      </form>
    </div>
  );
}