import { put } from '@vercel/blob';

// 1. Component Prices (Copied from your data/componentPrices.js)
const COMPONENT_PRICES = {
    "metal_parts": 75, "plastic_parts": 60, "fabric": 50, "chemicals": 50, "rubber_parts": 50,
    "wires": 200, "arc_alloy": 200, "battery": 250, "steel_spring": 300, "oil": 300, "duct_tape": 300, "magnet": 330,
    "electrical_components": 640, "mechanical_components": 640, "explosive_compound": 1000, "processor": 500, "voltage_converter": 500,
    "advanced_electrical_components": 1750, "advanced_mechanical_components": 1750,
    "scrap": 1, "organic_matter": 10
};

// 2. GitHub Configuration
const API_BASE = 'https://api.github.com/repos/RaidTheory/arcraiders-data/contents';
const ENDPOINTS = {
    ITEMS: `${API_BASE}/items`,
    QUESTS: `${API_BASE}/quests`,
    HIDEOUT: `${API_BASE}/hideout`
};

// --- Helper Functions ---

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
    if (item.rarity === 'Rare' && recycleValue > sellPrice) recommendation = "RECYCLE PRIORITY";

    return { recycleValue, roiPct, yields: yieldsList.join(', '), recommendation };
};

const fetchFolder = async (url) => {
    const listResponse = await fetch(url);
    if (!listResponse.ok) throw new Error(`Failed to fetch list from ${url}`);
    const files = await listResponse.json();

    const results = [];
    for (const file of files) {
        if (!file.name.endsWith('.json')) continue;
        const contentRes = await fetch(file.download_url);
        const content = await contentRes.json();
        results.push(content);
    }
    return results;
};

// --- Main Handler ---

export default async function handler(request, response) {
    // Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // A. Fetch All Data
        const [rawItems, rawQuests, rawHideout] = await Promise.all([
            fetchFolder(ENDPOINTS.ITEMS),
            fetchFolder(ENDPOINTS.QUESTS),
            fetchFolder(ENDPOINTS.HIDEOUT)
        ]);

        // B. Process Items
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

        // C. Process Quests
        const processedQuests = rawQuests.map(rawQuest => {
            const steps = (rawQuest.objectives || []).map(obj =>
                typeof obj === 'string' ? obj : (obj.en || '')
            ).filter(s => s);

            const rewards = (rawQuest.rewardItemIds || []).map(r => ({
                id: r.itemId,
                name: r.itemId?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || '',
                amount: r.quantity || 1
            }));

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

        // D. Process Upgrades (Hideout)
        const upgradesObj = { station_upgrades: {}, expedition_requirements: {} };
        rawHideout.forEach(station => {
            const stationId = station.id || 'unknown';
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

            if (stationId.includes('expedition')) {
                upgradesObj.expedition_requirements = levelsObj;
            } else {
                upgradesObj.station_upgrades[stationId] = levelsObj;
            }
        });

        // E. Create Final DB Object
        const fullDatabase = {
            items: processedItems,
            quests: processedQuests,
            upgrades: upgradesObj,
            lastUpdated: new Date().toISOString()
        };

        // F. Upload to Blob
        const blob = await put('arc_raiders_db.json', JSON.stringify(fullDatabase), {
            access: 'public',
            addRandomSuffix: false, // Keeps the URL constant!
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        return response.status(200).json({
            success: true,
            url: blob.url,
            timestamp: new Date()
        });

    } catch (error) {
        console.error("Update Error:", error);
        return response.status(500).json({ error: error.message, stack: error.stack });
    }
}