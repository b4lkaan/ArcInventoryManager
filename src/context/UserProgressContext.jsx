import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { userProgressService } from '../services/userProgressService';
import { getAllQuestsWithSteps } from '../services/dataService';

const UserProgressContext = createContext();

export const UserProgressProvider = ({ children }) => {
    // Initialize state with lazy initializers reading from service
    const [completedUpgrades, setCompletedUpgrades] = useState(() =>
        userProgressService.getCompletedUpgrades()
    );
    const [completedQuests, setCompletedQuests] = useState(() =>
        userProgressService.getCompletedQuests()
    );
    const [trackedQuests, setTrackedQuests] = useState(() =>
        userProgressService.getTrackedQuests()
    );

    // Initial data load for quests
    const [allQuests, setAllQuests] = useState(() => getAllQuestsWithSteps());

    // Refresh all quests if data might have changed (e.g. after reloadData)
    const refreshQuests = useCallback(() => {
        setAllQuests(getAllQuestsWithSteps());
    }, []);

    // Actions
    const toggleUpgrade = useCallback((station, level, isComplete) => {
        const updated = userProgressService.toggleUpgrade(station, level, isComplete);
        setCompletedUpgrades(new Set(updated));
    }, []);

    const toggleQuest = useCallback((questName, isComplete) => {
        const updated = userProgressService.toggleQuest(questName, isComplete);
        setCompletedQuests(new Set(updated));
    }, []);

    const toggleTrackedQuest = useCallback((questName, isTracked) => {
        const updated = userProgressService.toggleTrackedQuest(questName, isTracked);
        setTrackedQuests(new Set(updated));
    }, []);

    // Also expose bulk setters safely if needed, but actions are preferred
    // For now, we stick to the granular actions which ensure persistence via the service.

    // Memoize the context value
    const value = useMemo(() => ({
        completedUpgrades,
        completedQuests,
        trackedQuests,
        allQuests,
        refreshQuests,
        toggleUpgrade,
        toggleQuest,
        toggleTrackedQuest
    }), [
        completedUpgrades,
        completedQuests,
        trackedQuests,
        allQuests,
        refreshQuests,
        toggleUpgrade,
        toggleQuest,
        toggleTrackedQuest
    ]);

    return (
        <UserProgressContext.Provider value={value}>
            {children}
        </UserProgressContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserProgress = () => {
    const context = useContext(UserProgressContext);
    if (!context) {
        throw new Error('useUserProgress must be used within a UserProgressProvider');
    }
    return context;
};
