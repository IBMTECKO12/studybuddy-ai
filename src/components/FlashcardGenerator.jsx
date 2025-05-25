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
    <div className="flex flex-col items-center">
      <div 
        className={`w-full max-w-md h-64 p-6 mb-6 rounded-xl shadow-md cursor-pointer transition-all duration-300 ${isFlipped ? 'bg-blue-50' : 'bg-white'}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="h-full flex flex-col justify-center items-center">
          <h3 className="text-lg font-medium mb-2">
            {isFlipped ? 'Answer' : 'Question'}
          </h3>
          <p className="text-center">
            {isFlipped 
              ? allFlashcards[currentIndex].answer 
              : allFlashcards[currentIndex].question}
          </p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={handlePrev}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          {currentIndex + 1} / {allFlashcards.length}
        </span>
        <button 
          onClick={handleNext}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      <div className="w-full max-w-md p-4 border rounded-lg">
        <h3 className="font-medium mb-2">Add Your Own Flashcard</h3>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            addFlashcard(form.question.value, form.answer.value);
            form.reset();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <input
              name="question"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              name="answer"
              required
              rows="3"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Flashcard
          </button>
        </form>
      </div>
    </div>
  );
}