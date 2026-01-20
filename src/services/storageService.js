import { COMPONENT_PRICES } from '../data/componentPrices';

// Storage Keys
const KEYS = {
    ITEMS: 'arc_raiders_items_v1',
    QUESTS: 'arc_raiders_quests_v1',
    UPGRADES: 'arc_raiders_upgrades_v1'
};

// GitHub API Endpoints
const API_BASE = 'https://api.github.com/repos/RaidTheory/arcraiders-data/contents';
const ENDPOINTS = {
    ITEMS: `${API_BASE}/items`,
    QUESTS: `${API_BASE}/quests`,
    HIDEOUT: `${API_BASE}/hideout`
};

// --- Helper: ROI Logic (Unchanged) ---
const calculateRoi = (item) => {
    const sellPrice = item.value || 0;
    const recycleDict = item.recyclesInto || {};

    let recycleValue = 0;
    let yieldsList = [];

    for (const [compKey, qty] of Object.entries(recycleDict)) {
        const price = COMPONENT_PRICES[compKey] || 0;
        recycleValue += (price * qty);
        const name = compKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        yieldsList.push(`${name} (+${qty})`);
    }

    let roiPct = 0;
    if (sellPrice > 0) {
        roiPct = Math.round(((recycleValue - sellPrice) / sellPrice) * 100);
    }

    let recommendation = "NEUTRAL";
    if (roiPct > 0) recommendation = "RECYCLE";
    else if (roiPct < 0) recommendation = "SELL";

    if (item.rarity === 'Rare' && recycleValue > sellPrice) {
        recommendation = "RECYCLE PRIORITY";
    }

    return { recycleValue, roiPct, yields: yieldsList.join(', '), recommendation };
};

// --- Helper: Generic Fetcher ---
const fetchFolder = async (url, onProgress, label) => {
    const listResponse = await fetch(url);
    if (!listResponse.ok) throw new Error(`Failed to fetch ${label} list`);
    const files = await listResponse.json();

    const results = [];
    let count = 0;
    const total = files.length;

    for (const file of files) {
        if (!file.name.endsWith('.json')) continue;

        count++;
        onProgress(`Downloading ${label}: ${count}/${total}`);

        const contentRes = await fetch(file.download_url);
        const content = await contentRes.json();
        results.push(content);
    }
    return results;
};

export const storageService = {
    // Check if ALL data exists
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
        try {
            // 1. Fetch Items
            const rawItems = await fetchFolder(ENDPOINTS.ITEMS, onProgress, "Items");
            const processedItems = rawItems.map(rawItem => {
                const roiData = calculateRoi(rawItem);
                return {
                    id: rawItem.id,
                    name: rawItem.name?.en || rawItem.id,
                    category: rawItem.type || "Unknown",
                    sell_price: rawItem.value,
                    recycle_value: roiData.recycleValue,
                    roi_pct: roiData.roiPct,
                    yields: roiData.yields,
                    recommendation: roiData.recommendation,
                    image: rawItem.imageFilename,
                    rarity: rawItem.rarity,
                    weight: rawItem.weightKg,
                    description: rawItem.description?.en || ""
                };
            });
            localStorage.setItem(KEYS.ITEMS, JSON.stringify(processedItems));

            // 2. Fetch Quests
            const rawQuests = await fetchFolder(ENDPOINTS.QUESTS, onProgress, "Quests");
            // Transform from GitHub format to app format
            const processedQuests = rawQuests.map(rawQuest => {
                // Transform objectives array to steps array of strings
                const steps = (rawQuest.objectives || []).map(obj =>
                    typeof obj === 'string' ? obj : (obj.en || '')
                ).filter(s => s);

                // Transform rewardItemIds to rewards format
                const rewards = (rawQuest.rewardItemIds || []).map(r => ({
                    id: r.itemId,
                    name: r.itemId?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '',
                    amount: r.quantity || 1
                }));

                // Extract requirements from requirementItemIds if present
                const requirements = (rawQuest.requirementItemIds || []).map(r => ({
                    id: r.itemId,
                    name: r.itemId?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '',
                    amount: r.quantity || 1
                }));

                return {
                    quest_name: rawQuest.name?.en || rawQuest.id || 'Unknown Quest',
                    steps: steps,
                    requirements: requirements.length > 0 ? requirements : undefined,
                    rewards: rewards.length > 0 ? rewards : undefined,
                    trader: rawQuest.trader,
                    description: rawQuest.description?.en || ''
                };
            });
            localStorage.setItem(KEYS.QUESTS, JSON.stringify(processedQuests));

            // 3. Fetch Hideout (Upgrades)
            const rawHideout = await fetchFolder(ENDPOINTS.HIDEOUT, onProgress, "Upgrades");
            // The app expects { station_upgrades: { gunsmith: {...}, ... } }
            // GitHub format: { id, name: {...}, levels: [{level: 1, requirementItemIds: [...]}] }
            // We need to transform the array format to object format
            const upgradesObj = { station_upgrades: {}, expedition_requirements: {} };

            rawHideout.forEach(station => {
                const stationId = station.id || 'unknown';

                // Transform levels array to level_X object format
                const levelsObj = {};
                if (Array.isArray(station.levels)) {
                    station.levels.forEach(levelData => {
                        const levelKey = `level_${levelData.level}`;
                        const requirements = (levelData.requirementItemIds || []).map(r => ({
                            id: r.itemId,
                            name: r.itemId?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '',
                            amount: r.quantity || 1
                        }));
                        levelsObj[levelKey] = requirements;
                    });
                }

                // If it's the expedition file (special case if it exists in hideout folder)
                if (stationId.includes('expedition')) {
                    upgradesObj.expedition_requirements = levelsObj;
                } else {
                    upgradesObj.station_upgrades[stationId] = levelsObj;
                }
            });
            localStorage.setItem(KEYS.UPGRADES, JSON.stringify(upgradesObj));

            onProgress("Update Complete!");
            return true;

        } catch (error) {
            console.error("Update failed:", error);
            throw error;
        }
    }
};
