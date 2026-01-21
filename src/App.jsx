import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ItemCard from './components/ItemCard';
import QuestTracker from './components/QuestTracker';
import ActiveQuestSidebar from './components/ActiveQuestSidebar';
import LanguageSelector from './components/LanguageSelector';
import { findItem, getAllQuestsWithSteps, reloadData } from './services/dataService';
import { storageService } from './services/storageService';
import { userProgressService } from './services/userProgressService';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState('');
  const [isQuestTrackerOpen, setIsQuestTrackerOpen] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Loading State
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("");

  const [completedUpgrades, setCompletedUpgrades] = useState(() =>
    userProgressService.getCompletedUpgrades()
  );
  const [completedQuests, setCompletedQuests] = useState(() =>
    userProgressService.getCompletedQuests()
  );
  const [trackedQuests, setTrackedQuests] = useState(() =>
    userProgressService.getTrackedQuests()
  );

  const [allQuests, setAllQuests] = useState(() => getAllQuestsWithSteps());

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
          setAllQuests(getAllQuestsWithSteps());
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
  }, []);

  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = findItem(searchQuery);
    setSearchResults(results);

    // Auto-select if exact match (single result)
    if (results.length === 1 && results[0].name.toLowerCase() === searchQuery.toLowerCase()) {
      setSelectedItem(results[0]);
    } else {
      setSelectedItem(null);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSearchResults([]);
    setSelectedItem(null);
    setQuery('');
  }, []);

  const handleSelectItem = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleToggleTrackQuest = useCallback((questName, isTracked) => {
    const updated = userProgressService.toggleTrackedQuest(questName, isTracked);
    setTrackedQuests(new Set(updated));
    if (isTracked) setIsSidebarOpen(true);
  }, []);

  // NEW: Loading Screen Render
  if (isInitializing) {
    return (
      <div className="loading-screen" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#fff'
      }}>
        <div className="loading-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
        <h2 style={{ margin: '0 0 1rem 0', fontWeight: '300' }}>ARC Raiders Item Analyzer</h2>
        <div className="spinner" style={{ margin: '20px', fontSize: '2rem' }}>♻️</div>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>{loadingStatus}</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-decoration">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="logo-group">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <h1>ARC Raiders</h1>
            </div>
            <p className="tagline">Item Analyzer</p>
          </div>
          <div className="header-buttons">
            <LanguageSelector />
            <button
              className="quest-btn"
              onClick={() => setIsQuestTrackerOpen(true)}
            >
              📋 Progression
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!selectedItem ? (
          <>
            <SearchBar onSearch={handleSearch} onClear={handleClear} />
            <SearchResults
              results={searchResults}
              onSelect={handleSelectItem}
              query={query}
            />
          </>
        ) : (
          <ItemCard
            item={selectedItem}
            onBack={handleBack}
            completedUpgrades={completedUpgrades}
            completedQuests={completedQuests}
          />
        )}
      </main>

      <QuestTracker
        isOpen={isQuestTrackerOpen}
        onClose={() => setIsQuestTrackerOpen(false)}
        completedQuests={completedQuests}
        onUpdate={setCompletedQuests}
        trackedQuests={trackedQuests}
        onToggleTrack={handleToggleTrackQuest}
        completedUpgrades={completedUpgrades}
        onUpdateUpgrades={setCompletedUpgrades}
      />

      <ActiveQuestSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
        trackedQuests={trackedQuests}
        allQuests={allQuests}
        onRemove={(name) => handleToggleTrackQuest(name, false)}
      />

      <footer className="app-footer">
        <p>Keep • Sell • Recycle — Make the right choice</p>
      </footer>
    </div>
  );
}

export default App;

