import { useState, useEffect } from "react";
import { useSpacedRepetition } from "../hooks/useSpacedRepetition";
import { useAuth } from "../context/AuthContext";

export default function SpacedRepetition() {
  const { currentUser } = useAuth();
  const { dueItems, updateItem, addItem, isLoading } = useSpacedRepetition(currentUser?.uid);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newItem, setNewItem] = useState({ question: "", answer: "" });

  const handleQualityRating = (quality) => {
    if (dueItems.length === 0) return;
    
    updateItem(dueItems[currentItemIndex].id, quality);
    setShowAnswer(false);
    
    if (currentItemIndex < dueItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      setCurrentItemIndex(0);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.question.trim() || !newItem.answer.trim()) return;
    
    addItem({
      id: Date.now().toString(),
      question: newItem.question,
      answer: newItem.answer,
      type: "flashcard"
    });
    setNewItem({ question: "", answer: "" });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading your review items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Review Items</h2>
        
        {dueItems.length > 0 ? (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-medium mb-2">Question:</h3>
              <p className="mb-4">{dueItems[currentItemIndex]?.question}</p>
              
              {showAnswer && (
                <>
                  <h3 className="font-medium mb-2">Answer:</h3>
                  <p className="mb-4">{dueItems[currentItemIndex]?.answer}</p>
                </>
              )}
              
              <div className="flex space-x-2">
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Answer
                  </button>
                ) : (
                  <>
                    <p className="self-center text-sm text-gray-600 mr-2">
                      How well did you know this?
                    </p>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleQualityRating(rating)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {rating}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Item {currentItemIndex + 1} of {dueItems.length} due for review
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No items due for review right now!</p>
        )}
      </div>

      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Add New Item</h2>
        <form onSubmit={handleAddItem} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <input
              type="text"
              value={newItem.question}
              onChange={(e) => setNewItem({...newItem, question: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              value={newItem.answer}
              onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
              rows="3"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add to Review Schedule
          </button>
        </form>
      </div>
    </div>
  );
}