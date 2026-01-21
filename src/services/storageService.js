// Storage Keys
const KEYS = {
    ITEMS: 'arc_raiders_items_v1',
    QUESTS: 'arc_raiders_quests_v1',
    UPGRADES: 'arc_raiders_upgrades_v1'
};

// Database URL from environment variable (set in .env as VITE_DB_URL)
const DB_URL = import.meta.env.VITE_DB_URL ||
    "https://3xepmfoaupvwolpr.public.blob.vercel-storage.com/arc_raiders_db.json";

export const storageService = {
    // Check if we have data in memory
    hasData: () => {
        return !!localStorage.getItem(KEYS.ITEMS) &&
            !!localStorage.getItem(KEYS.QUESTS) &&
            !!localStorage.getItem(KEYS.UPGRADES);
    },

    // Getters
    getItems: () => JSON.parse(localStorage.getItem(KEYS.ITEMS) || "[]"),
    getQuests: () => JSON.parse(localStorage.getItem(KEYS.QUESTS) || "[]"),
    getUpgrades: () => JSON.parse(localStorage.getItem(KEYS.UPGRADES) || "{}"),

    // Main Update Function
    updateData: async (onProgress) => {
        onProgress("Downloading database...");

        try {
            // Fetch the pre-processed JSON file directly
            // add a timestamp to bypass browser caching if needed
            const res = await fetch(`${DB_URL}?t=${Date.now()}`);
            if (!res.ok) throw new Error("Failed to load database. ensure api/update has run at least once and DB_URL is correct.");

            const db = await res.json();

            // Load into your app state
            // The structure matches what we built in api/update.js
            localStorage.setItem(KEYS.ITEMS, JSON.stringify(db.items));
            localStorage.setItem(KEYS.QUESTS, JSON.stringify(db.quests));
            localStorage.setItem(KEYS.UPGRADES, JSON.stringify(db.upgrades));

            onProgress("Ready!");
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};
