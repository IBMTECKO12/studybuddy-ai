import { useState } from "react";

export default function FlashcardGenerator({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAddedCards, setUserAddedCards] = useState([]);

  const allFlashcards = [...flashcards, ...userAddedCards];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === allFlashcards.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? allFlashcards.length - 1 : prevIndex - 1
    );
  };

  const addFlashcard = (question, answer) => {
    setUserAddedCards([...userAddedCards, { question, answer }]);
  };

  if (allFlashcards.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No flashcards available. Upload content to generate some!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* Flashcards display */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mb-6">
        {allFlashcards.length > 0 ? (
          <div 
            className={`relative w-full h-48 sm:h-64 md:h-72 rounded-xl shadow-md cursor-pointer transition-all duration-300 ${
              isFlipped ? 'bg-blue-50' : 'bg-white'
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
              <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-4">
                {isFlipped ? 'Answer' : 'Question'}
              </h3>
              <p className="text-center text-sm sm:text-base">
                {isFlipped 
                  ? allFlashcards[currentIndex].answer 
                  : allFlashcards[currentIndex].question}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No flashcards available. Upload content to generate some!
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button 
          onClick={handlePrev}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm sm:text-base">
          {currentIndex + 1} / {allFlashcards.length}
        </span>
        <button 
          onClick={handleNext}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
        >
          Next
        </button>
      </div>

      {/* Add new flashcard form */}
      <div className="w-full max-w-md sm:max-w-lg bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="font-medium mb-3 text-sm sm:text-base">Add Your Own Flashcard</h3>
        <form onSubmit={addFlashcard} className="space-y-3">
          <div>
            <label className="block text-sm sm:text-base font-medium mb-1">Question</label>
            <input
              name="question"
              required
              className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium mb-1">Answer</label>
            <textarea
              name="answer"
              required
              rows="3"
              className="w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Add Flashcard
          </button>
        </form>
      </div>
    </div>
  );
}