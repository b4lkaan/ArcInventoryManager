import { COMPONENT_PRICES } from '../data/componentPrices';

const STORAGE_KEY = 'arc_raiders_db_v1';
const REPO_API_URL = 'https://api.github.com/repos/RaidTheory/arcraiders-data/contents/items';

// Helper: ROI Logic (Moved from script to Client)
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

    // Priority override for Rares
    if (item.rarity === 'Rare' && recycleValue > sellPrice) {
        recommendation = "RECYCLE PRIORITY";
    }

    return { recycleValue, roiPct, yields: yieldsList.join(', '), recommendation };
};

export const storageService = {
    // Check if we have data cached
    hasData: () => {
        return !!localStorage.getItem(STORAGE_KEY);
    },

    // Get current data (Synchronous)
    getData: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch (e) {
            console.error("Data corruption", e);
            return [];
        }
    },

    // Fetch from GitHub, Process, and Save
    updateData: async (onProgress) => {
        try {
            onProgress("Fetching file list...");
            // 1. Get list of files
            const listResponse = await fetch(REPO_API_URL);
            if (!listResponse.ok) throw new Error("GitHub API limit or error");
            const files = await listResponse.json();

            const total = files.length;
            const processedDb = [];

            // 2. Fetch each file content
            // (Using chunking to avoid browser network limits if needed, but sequential is safer for progress bars)
            let count = 0;
            for (const file of files) {
                if (!file.name.endsWith('.json')) continue;

                count++;
                onProgress(`Downloading item ${count}/${total}...`);

                // Fetch raw content
                const contentRes = await fetch(file.download_url);
                const rawItem = await contentRes.json();

                // 3. Apply ROI Logic
                const roiData = calculateRoi(rawItem);

                // 4. Map to App Schema
                processedDb.push({
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
                });
            }

            // 5. Save to Storage
            onProgress("Saving database...");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(processedDb));
            return processedDb;

        } catch (error) {
            console.error("Update failed:", error);
            throw error;
        }
    }
};
