import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { storageService } from '../services/storageService';

const DataContext = createContext();

/**
 * DataProvider manages all application data state (items, quests, upgrades)
 * replacing the previous module-level variables in dataService.js
 */
export const DataProvider = ({ children }) => {
    const [itemsDb, setItemsDb] = useState([]);
    const [questsDb, setQuestsDb] = useState([]);
    const [upgradesDb, setUpgradesDb] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from storage on mount
    useEffect(() => {
        if (storageService.hasData()) {
            setItemsDb(storageService.getItems());
            setQuestsDb(storageService.getQuests());
            setUpgradesDb(storageService.getUpgrades());
            setIsLoaded(true);
        }
    }, []);

    // Reload function to refresh data after updates
    const reloadData = useCallback(() => {
        setItemsDb(storageService.getItems());
        setQuestsDb(storageService.getQuests());
        setUpgradesDb(storageService.getUpgrades());
        setIsLoaded(true);
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        itemsDb,
        questsDb,
        upgradesDb,
        isLoaded,
        reloadData
    }), [itemsDb, questsDb, upgradesDb, isLoaded, reloadData]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

/**
 * Hook to access data context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
