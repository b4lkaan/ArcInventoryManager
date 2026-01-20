import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ItemCard from './components/ItemCard';
import UpgradeTracker from './components/UpgradeTracker';
import QuestTracker from './components/QuestTracker';
import ActiveQuestSidebar from './components/ActiveQuestSidebar';
import { findItem, getAllQuestsWithSteps } from './services/dataService';
import { userProgressService } from './services/userProgressService';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState('');
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isQuestTrackerOpen, setIsQuestTrackerOpen] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [completedUpgrades, setCompletedUpgrades] = useState(() =>
    userProgressService.getCompletedUpgrades()
  );
  const [completedQuests, setCompletedQuests] = useState(() =>
    userProgressService.getCompletedQuests()
  );
  const [trackedQuests, setTrackedQuests] = useState(() =>
    userProgressService.getTrackedQuests()
  );

  const [allQuests] = useState(() => getAllQuestsWithSteps());

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
            <button
              className="upgrade-btn"
              onClick={() => setIsTrackerOpen(true)}
            >
              🛠️ Upgrades
            </button>
            <button
              className="quest-btn"
              onClick={() => setIsQuestTrackerOpen(true)}
            >
              📜 Quests
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

      <UpgradeTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        completedUpgrades={completedUpgrades}
        onUpdate={setCompletedUpgrades}
      />

      <QuestTracker
        isOpen={isQuestTrackerOpen}
        onClose={() => setIsQuestTrackerOpen(false)}
        completedQuests={completedQuests}
        onUpdate={setCompletedQuests}
        trackedQuests={trackedQuests}
        onToggleTrack={handleToggleTrackQuest}
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
