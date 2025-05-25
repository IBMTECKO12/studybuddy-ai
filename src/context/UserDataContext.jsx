// /context/UserDataContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserData, saveUserData } from '../services/firebase';

const UserDataContext = createContext();

export function UserDataProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data || {});
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const updateUserData = async (newData) => {
    if (!currentUser) return;
    
    try {
      const updatedData = { ...userData, ...newData };
      await saveUserData(currentUser.uid, updatedData);
      setUserData(updatedData);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, loading, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  return useContext(UserDataContext);
}