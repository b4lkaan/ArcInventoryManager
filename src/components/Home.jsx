import React, { useState, useCallback } from 'react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import ItemCard from './ItemCard';
import { findItem } from '../services/dataService';

const Home = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [query, setQuery] = useState('');

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

    if (selectedItem) {
        return (
            <ItemCard
                item={selectedItem}
                onBack={handleBack}
            />
        );
    }

    return (
        <>
            <SearchBar onSearch={handleSearch} onClear={handleClear} />
            <SearchResults
                results={searchResults}
                onSelect={handleSelectItem}
                query={query}
            />
        </>
    );
};

export default Home;
