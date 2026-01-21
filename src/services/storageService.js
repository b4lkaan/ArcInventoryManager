// Storage Keys
const KEYS = {
    ITEMS: 'arc_raiders_items_v1',
    QUESTS: 'arc_raiders_quests_v1',
    UPGRADES: 'arc_raiders_upgrades_v1'
};

// Database URL from environment variable (set in .env as VITE_DB_URL)
const DB_URL = import.meta.env.VITE_DB_URL ||
    "https://3xepmfoaupvwolpr.public.blob.vercel-storage.com/arc_raiders_db.json";

// Retry configuration
const RETRY_CONFIG = {
    maxAttempts: 3,
    baseDelayMs: 1000, // 1 second, then 2s, then 4s
};

/**
 * Fetch with exponential backoff retry
 */
const fetchWithRetry = async (url, onProgress, attempt = 1) => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: Failed to load database`);
        }
        return res;
    } catch (error) {
        if (attempt >= RETRY_CONFIG.maxAttempts) {
            throw new Error(`Failed after ${attempt} attempts: ${error.message}`);
        }

        const delayMs = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1);
        onProgress?.(`Retry ${attempt}/${RETRY_CONFIG.maxAttempts} in ${delayMs / 1000}s...`);

        await new Promise(resolve => setTimeout(resolve, delayMs));
        return fetchWithRetry(url, onProgress, attempt + 1);
    }
};

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

    // Main Update Function with retry logic
    updateData: async (onProgress) => {
        onProgress("Downloading database...");

        try {
            // Fetch with retry and cache-busting timestamp
            const res = await fetchWithRetry(
                `${DB_URL}?t=${Date.now()}`,
                onProgress
            );

            const db = await res.json();

            // Store in localStorage
            localStorage.setItem(KEYS.ITEMS, JSON.stringify(db.items));
            localStorage.setItem(KEYS.QUESTS, JSON.stringify(db.quests));
            localStorage.setItem(KEYS.UPGRADES, JSON.stringify(db.upgrades));

            onProgress("Ready!");
            return true;
        } catch (e) {
            console.error('Storage service error:', e);
            throw e;
        }
    }
};

