import { getRecommendation } from '../services/dataService';
import './SearchResults.css';

export default function SearchResults({ results, onSelect, query }) {
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
                    <span className="results-hint">Select an item to see full analysis</span>
                )}
            </div>
            <div className="results-list">
                {results.map((item) => {
                    const rec = getRecommendation(item);
                    return (
                        <button
                            key={item.id}
                            className="result-item"
                            onClick={() => onSelect(item)}
                        >
                            <div className="result-left">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="result-image"
                                        loading="lazy"
                                    />
                                )}
                                <div className="result-info">
                                    <span className="result-name">{item.name}</span>
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
}
