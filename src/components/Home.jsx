import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import ItemCard from './ItemCard';
import { findItem, getAllItems } from '../services/dataService';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    // Effect to perform search when query changes
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const results = findItem(query);
        setSearchResults(results);
    }, [query]);

    const handleSearch = useCallback((newQuery) => {
        if (newQuery) {
            setSearchParams({ q: newQuery });
        } else {
            setSearchParams({});
        }
    }, [setSearchParams]);

    const handleClear = useCallback(() => {
        setSearchParams({});
    }, [setSearchParams]);

    const handleSelectItem = useCallback((item) => {
        navigate(`/item/${item.id}`);
    }, [navigate]);

    return (
        <>
            <SearchBar onSearch={handleSearch} onClear={handleClear} initialQuery={query} />
            <SearchResults
                results={searchResults}
                onSelect={handleSelectItem}
                query={query}
            />
        </>
    );
};

const ItemDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Find item by ID from all items
    const item = getAllItems().find(i => i.id === id);

    if (!item) {
        return (
            <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Item not found</h2>
                <button onClick={() => navigate('/')} className="back-button">
                    Return to Search
                </button>
            </div>
        );
    }

    return (
        <ItemCard
            item={item}
            onBack={() => navigate(-1)}
        />
    );
};

const Home = () => {
    return (
        <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
        </Routes>
    );
};

export default Home;
