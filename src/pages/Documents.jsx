import { useState, useEffect } from "react";
import DocumentUpload from "../components/DocumentUpload";
import { useAuth } from "../context/AuthContext";
import { getUserData, saveUserData } from "../services/firebase";

export default function Documents() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const loadDocuments = async () => {
      try {
        const userData = await getUserData(currentUser.uid);
        if (userData?.documents) {
          setDocuments(userData.documents);
        }
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [currentUser]);

  const handleContentGenerated = async (type, content) => {
    const newDocument = {
      id: Date.now().toString(),
      type,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);

    if (currentUser) {
      try {
        await saveUserData(currentUser.uid, { documents: updatedDocuments });
      } catch (error) {
        console.error("Error saving document:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading your documents...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Study Documents</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DocumentUpload onContentGenerated={handleContentGenerated} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Document Library</h2>
            
            {documents.length === 0 ? (
              <p className="text-gray-500">No documents yet. Upload some content!</p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium">
                      {doc.type === 'flashcards' ? 'Flashcards' : 'Summary'} -{' '}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </h3>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                      {doc.type === 'flashcards' ? (
                        <p>{JSON.parse(doc.content).length} flashcards generated</p>
                      ) : (
                        <p className="text-sm whitespace-pre-line">
                          {doc.content.slice(0, 200)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}