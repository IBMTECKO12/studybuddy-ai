import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/firebase";

export default function Settings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    dailyReminder: false,
    reminderTime: "18:00"
  });

  useEffect(() => {
    if (currentUser?.settings) {
      setSettings(currentUser.settings);
    }
  }, [currentUser]);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;
    
    try {
      // In a real app, you would save these to Firebase
      console.log("Settings would be saved here:", settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Email</p>
                <p>{currentUser?.email || "Not signed in"}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="darkMode">Dark Mode</label>
                <input
                  type="checkbox"
                  id="darkMode"
                  name="darkMode"
                  checked={settings.darkMode}
                  onChange={handleSettingChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="notifications">Enable Notifications</label>
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleSettingChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="dailyReminder">Daily Study Reminder</label>
                <input
                  type="checkbox"
                  id="dailyReminder"
                  name="dailyReminder"
                  checked={settings.dailyReminder}
                  onChange={handleSettingChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </div>
              
              {settings.dailyReminder && (
                <div className="flex items-center justify-between">
                  <label htmlFor="reminderTime">Reminder Time</label>
                  <input
                    type="time"
                    id="reminderTime"
                    name="reminderTime"
                    value={settings.reminderTime}
                    onChange={handleSettingChange}
                    className="p-1 border rounded"
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}