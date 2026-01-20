const STORAGE_KEY = 'arc_raiders_progress_v1';
const QUEST_STORAGE_KEY = 'arc_raiders_quest_progress_v1';

export const userProgressService = {
    /**
     * Get all completed upgrades
     * @returns {Set<string>} Set of composite keys "Station-Level"
     */
    getCompletedUpgrades: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return new Set();
            const parsed = JSON.parse(stored);
            return new Set(parsed.completedUpgrades || []);
        } catch (e) {
            console.error('Failed to load progress', e);
            return new Set();
        }
    },

    /**
     * Toggle completion status of an upgrade
     * @param {string} station - Station name
     * @param {number} level - Upgrade level
     * @param {boolean} isComplete - New status
     * @returns {Set<string>} Updated set of completed upgrades
     */
    toggleUpgrade: (station, level, isComplete) => {
        const key = `${station}-${level}`;
        const current = userProgressService.getCompletedUpgrades();

        if (isComplete) {
            current.add(key);
        } else {
            current.delete(key);
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                completedUpgrades: Array.from(current)
            }));
        } catch (e) {
            console.error('Failed to save progress', e);
        }

        return current;
    },

    /**
     * Check if a specific upgrade is complete
     * @param {string} station 
     * @param {number} level 
     * @returns {boolean}
     */
    isUpgradeComplete: (station, level) => {
        const completed = userProgressService.getCompletedUpgrades();
        return completed.has(`${station}-${level}`);
    },
    /**
     * Get all completed quests
     * @returns {Set<string>} Set of quest names
     */
    getCompletedQuests: () => {
        try {
            const stored = localStorage.getItem(QUEST_STORAGE_KEY);
            if (!stored) return new Set();
            const parsed = JSON.parse(stored);
            return new Set(parsed.completedQuests || []);
        } catch (e) {
            console.error('Failed to load quest progress', e);
            return new Set();
        }
    },

    /**
     * Toggle completion status of a quest
     * @param {string} questName 
     * @param {boolean} isComplete 
     * @returns {Set<string>} Updated set of completed quests
     */
    toggleQuest: (questName, isComplete) => {
        const current = userProgressService.getCompletedQuests();

        if (isComplete) {
            current.add(questName);
        } else {
            current.delete(questName);
        }

        try {
            localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify({
                completedQuests: Array.from(current)
            }));
        } catch (e) {
            console.error('Failed to save quest progress', e);
        }

        return current;
    },

    /**
     * Check if a quest is complete
     * @param {string} questName 
     * @returns {boolean}
     */
    isQuestComplete: (questName) => {
        const completed = userProgressService.getCompletedQuests();
        return completed.has(questName);
    }
};
