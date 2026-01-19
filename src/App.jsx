import { useState, useCallback, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ItemCard from './components/ItemCard';
import UpgradeTracker from './components/UpgradeTracker';
import { findItem } from './services/dataService';
import { userProgressService } from './services/userProgressService';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState('');
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [completedUpgrades, setCompletedUpgrades] = useState(new Set());

  useEffect(() => {
    // Load initial state
    setCompletedUpgrades(userProgressService.getCompletedUpgrades());
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
          <button
            className="upgrade-btn"
            onClick={() => setIsTrackerOpen(true)}
          >
            🛠️ Upgrades
          </button>
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
          />
        )}
      </main>

      <UpgradeTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onUpdate={setCompletedUpgrades}
      />

      <footer className="app-footer">
        <p>Keep • Sell • Recycle — Make the right choice</p>
      </footer>
    </div>
  );
}

export default App;
