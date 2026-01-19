import { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, onClear }) {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 200);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleClear = () => {
        setQuery('');
        onClear?.();
        inputRef.current?.focus();
    };

    return (
        <div className="search-container">
            <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search for an item... (e.g., 'Toaster', 'Driver')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button className="clear-button" onClick={handleClear}>
                        ✕
                    </button>
                )}
            </div>
            <p className="search-hint">
                Type to search • Click an item to see detailed recommendation
            </p>
        </div>
    );
}
