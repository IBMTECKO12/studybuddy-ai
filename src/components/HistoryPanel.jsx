// components/HistoryPanel.jsx
import { useEffect, useState } from 'react';
import { getDocumentHistory } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function HistoryPanel({ onSelect }) {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (currentUser) {
        try {
          const docs = await getDocumentHistory(currentUser.uid);
          setHistory(docs);
        } catch (error) {
          console.error("Failed to load history:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadHistory();
  }, [currentUser]);

  if (loading) return <div className="p-4 text-center">Loading history...</div>;
  if (!currentUser) return <div className="p-4 text-center">Sign in to view history</div>;

  return (
    <div className="space-y-2 p-2">
      <h3 className="font-medium mb-2">Recent Documents</h3>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No document history found</p>
      ) : (
        <ul className="space-y-1">
          {history.map((doc, index) => (
            <li 
              key={index}
              onClick={() => onSelect(doc)}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm truncate"
            >
              {doc.fileName || `Document ${index + 1}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}