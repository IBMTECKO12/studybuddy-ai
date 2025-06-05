import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

const logout = () => {
  return signOut(auth);
};

// User data functions
const saveUserData = async (userId, data) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

const getUserData = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Chat history functions
const saveChatHistory = async (userId, messages) => {
  try {
    await setDoc(doc(db, "chatHistory", userId), {
      messages,
      lastUpdated: serverTimestamp()
    }, { merge: true }); // Merge to avoid overwriting other fields
  } catch (error) {
    console.error("Error saving chat history:", error);
    throw error;
  }
};

const getChatHistory = async (userId) => {
  try {
    const docRef = doc(db, "chatHistory", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().messages || [] : [];
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
};

// Document history functions
const saveDocumentHistory = async (userId, documentData) => {
  try {
    await addDoc(collection(db, "documentHistory"), {
      userId,
      ...documentData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving document history:", error);
    throw error;
  }
};

const getDocumentHistory = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, "documentHistory"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting document history:", error);
    throw error;
  }
};

export { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  saveUserData, 
  getUserData,
  saveChatHistory,
  getChatHistory,
  saveDocumentHistory,
  getDocumentHistory,
  serverTimestamp
};