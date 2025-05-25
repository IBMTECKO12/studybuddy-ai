import { useState, useEffect } from "react";
import FlashcardGenerator from "../components/FlashcardGenerator";
import { useAuth } from "../context/AuthContext";
import { getUserData, saveUserData } from "../services/firebase";

export default function Flashcards() {
  const { currentUser } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const loadFlashcards = async () => {
      try {
        const userData = await getUserData(currentUser.uid);
        if (userData?.flashcards) {
          setFlashcards(userData.flashcards);
        }
      } catch (error) {
        console.error("Error loading flashcards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [currentUser]);

  const handleFlashcardsUpdate = async (newFlashcards) => {
    setFlashcards(newFlashcards);
    if (currentUser) {
      try {
        await saveUserData(currentUser.uid, { flashcards: newFlashcards });
      } catch (error) {
        console.error("Error saving flashcards:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading your flashcards...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Flashcards</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <FlashcardGenerator 
          flashcards={flashcards} 
          onFlashcardsUpdate={handleFlashcardsUpdate}
        />
      </div>
    </div>
  );
}