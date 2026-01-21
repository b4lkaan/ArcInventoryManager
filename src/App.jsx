import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import QuestTracker from './components/QuestTracker';
import ActiveQuestSidebar from './components/ActiveQuestSidebar';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Home from './components/Home';
import { reloadData } from './services/dataService';
import { storageService } from './services/storageService';
import { useUserProgress } from './context/UserProgressContext';
import './App.css';

function App() {
  const [isQuestTrackerOpen, setIsQuestTrackerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Loading State
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("");

  const { refreshQuests } = useUserProgress();

  // Initialization Effect - runs once on mount
  useEffect(() => {
    const init = async () => {
      if (!storageService.hasData()) {
        try {
          setLoadingStatus("Connecting to database...");
          await storageService.updateData((status) => {
            setLoadingStatus(status);
          });
          reloadData();
          refreshQuests();
        } catch (err) {
          toast.error("Failed to update database: " + err.message);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };
    init();
  }, [refreshQuests]);

  if (isInitializing) {
    return <LoadingScreen status={loadingStatus} />;
  }

  return (
    <Layout onOpenProgression={() => setIsQuestTrackerOpen(true)}>
      <Home />

      <QuestTracker
        isOpen={isQuestTrackerOpen}
        onClose={() => setIsQuestTrackerOpen(false)}
      />

      <ActiveQuestSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </Layout>
  );
}

export default App;
