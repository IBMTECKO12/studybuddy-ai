import { useState, useEffect } from "react";
import { saveUserData, getUserData } from "../services/firebase";

export function useSpacedRepetition(userId) {
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load schedule from Firebase on mount
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadSchedule = async () => {
      try {
        const userData = await getUserData(userId);
        if (userData?.spacedRepetitionSchedule) {
          setSchedule(userData.spacedRepetitionSchedule);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [userId]);

  // Calculate items due for review
  const getDueItems = () => {
    const now = new Date();
    return schedule.filter(item => new Date(item.nextReview) <= now);
  };

  // Add new item to schedule
  const addItem = async (item) => {
    const newItem = {
      ...item,
      nextReview: new Date(), // Review immediately first time
      repetition: 0,
      easeFactor: 2.5, // Default ease factor
      interval: 1 // Days until next review
    };

    const newSchedule = [...schedule, newItem];
    setSchedule(newSchedule);

    if (userId) {
      try {
        await saveUserData(userId, { spacedRepetitionSchedule: newSchedule });
      } catch (error) {
        console.error("Error saving schedule:", error);
      }
    }
  };

  // Update item after review
  const updateItem = async (itemId, quality) => {
    const itemIndex = schedule.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const item = schedule[itemIndex];
    let { repetition, easeFactor, interval } = item;

    // SM-2 algorithm implementation
    if (quality >= 3) {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition++;
    } else {
      repetition = 0;
      interval = 1;
    }

    // Adjust ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const updatedItem = {
      ...item,
      repetition,
      easeFactor,
      interval,
      nextReview,
      lastReviewed: new Date()
    };

    const newSchedule = [...schedule];
    newSchedule[itemIndex] = updatedItem;
    setSchedule(newSchedule);

    if (userId) {
      try {
        await saveUserData(userId, { spacedRepetitionSchedule: newSchedule });
      } catch (error) {
        console.error("Error saving schedule:", error);
      }
    }
  };

  return {
    schedule,
    dueItems: getDueItems(),
    addItem,
    updateItem,
    isLoading
  };
}