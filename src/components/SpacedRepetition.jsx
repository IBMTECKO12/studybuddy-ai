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
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Review items section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Review Items</h2>
        
        {dueItems.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
              <h3 className="font-medium mb-3 text-sm sm:text-base">Question:</h3>
              <p className="mb-4 text-sm sm:text-base">{dueItems[currentItemIndex]?.question}</p>
              
              {showAnswer && (
                <>
                  <h3 className="font-medium mb-3 text-sm sm:text-base">Answer:</h3>
                  <p className="mb-4 text-sm sm:text-base">{dueItems[currentItemIndex]?.answer}</p>
                </>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Show Answer
                  </button>
                ) : (
                  <>
                    <span className="text-sm sm:text-base text-gray-600 mr-2">
                      How well did you know this?
                    </span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleQualityRating(rating)}
                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                      >
                        {rating}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-600">
              Item {currentItemIndex + 1} of {dueItems.length} due for review
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm sm:text-base">
            No items due for review right now!
          </p>
        )}
      </div>

      {/* Add new item section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Item</h2>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-medium mb-1">Question</label>
            <input
              type="text"
              value={newItem.question}
              onChange={(e) => setNewItem({...newItem, question: e.target.value})}
              className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium mb-1">Answer</label>
            <textarea
              value={newItem.answer}
              onChange={(e) => setNewItem({...newItem, answer: e.target.value})}
              rows="3"
              className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
          >
            Add to Review Schedule
          </button>
        </form>
      </div>
    </div>
  );
}