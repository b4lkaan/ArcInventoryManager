import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { getRecommendation } from '../services/dataService';
import { useUserProgress } from '../context/UserProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedValue } from '../utils/localization';
import './SearchResults.css';

const SearchResults = React.memo(function SearchResults({ results, onSelect, query }) {
    const { language } = useLanguage();
    const { completedUpgrades, completedQuests } = useUserProgress();
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [results]);

    // Memoize the processed results to avoid recalculating recommendations on every render
    const processedResults = useMemo(() => {
        return results.map(item => ({
            ...item,
            recommendation: getRecommendation(item, completedUpgrades, completedQuests)
        }));
    }, [results, completedUpgrades, completedQuests]);

    // Keyboard navigation handler
    const handleKeyDown = useCallback((e) => {
        if (!results.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    onSelect(results[selectedIndex]);
                } else if (results.length === 1) {
                    onSelect(results[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    }, [results, selectedIndex, onSelect]);

    // Attach keyboard listener to document
    useEffect(() => {
        if (results.length > 0) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [results.length, handleKeyDown]);

    if (!query || query.trim() === '') {
        return null;
    }

    if (results.length === 0) {
        return (
            <div className="results-container">
                <div className="no-results">
                    <span className="no-results-icon">❓</span>
                    <h3>Unknown Item</h3>
                    <p>No item found matching "{query}"</p>
                    <p className="caution-text">⚠️ If this item exists in-game, exercise caution before selling or recycling.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="results-container">
            <div className="results-header">
                <span className="results-count">{results.length} item{results.length !== 1 ? 's' : ''} found</span>
                {results.length > 1 && (
                    <span className="results-hint">↑↓ to navigate • Enter to select</span>
                )}
            </div>
            <div className="results-list">
                {processedResults.map((item, index) => {
                    const rec = item.recommendation;
                    const isSelected = index === selectedIndex;
                    return (
                        <button
                            key={item.id}
                            className={`result-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelect(item)}
                        >
                            <div className="result-left">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={getLocalizedValue(item.name, language)}
                                        className="result-image"
                                        loading="lazy"
                                    />
                                )}
                                <div className="result-info">
                                    <span className="result-name">{getLocalizedValue(item.name, language)}</span>
                                    <span className="result-category">{item.category}</span>
                                </div>
                            </div>
                            <div
                                className="result-badge"
                                style={{
                                    backgroundColor: rec.bgColor,
                                    color: rec.color,
                                    borderColor: rec.color
                                }}
                            >
                                <span className="badge-icon">{rec.icon}</span>
                                <span className="badge-label">{rec.label}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

export default SearchResults;

