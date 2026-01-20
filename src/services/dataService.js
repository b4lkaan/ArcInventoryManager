import itemsDb from '../../arc_raiders_db.json';
import questsDb from '../../arc_raiders_quest.json';
import upgradesDb from '../../arc_raiders_upgrades.json';

// Cache for enriched items
let enrichedItemsCache = null;

const formatStationName = (key) => {
  return key.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getEnrichedItems = () => {
  if (enrichedItemsCache) return enrichedItemsCache;

  // 1. Initialize Map with items (cloning to avoid mutation)
  const itemsMap = new Map();
  itemsDb.forEach(item => {
    itemsMap.set(item.id, {
      ...item,
      // Reset usage to be populated dynamically
      usage: {
        quest: [],
        upgrade: []
      }
    });
  });

  // 2. Process Station Upgrades
  if (upgradesDb.station_upgrades) {
    Object.entries(upgradesDb.station_upgrades).forEach(([stationKey, levels]) => {
      const stationName = formatStationName(stationKey);
      Object.entries(levels).forEach(([levelKey, requirements]) => {
        const level = parseInt(levelKey.replace('level_', ''));
        requirements.forEach(req => {
          if (req.id && itemsMap.has(req.id)) {
            itemsMap.get(req.id).usage.upgrade.push({
              station: stationName,
              level: level,
              amount: req.amount
            });
          }
        });
      });
    });
  }

  // 3. Process Expedition Requirements (treated as quests for now)
  if (upgradesDb.expedition_requirements) {
    Object.entries(upgradesDb.expedition_requirements).forEach(([levelKey, requirements]) => {
      const level = parseInt(levelKey.replace('level_', ''));
      requirements.forEach(req => {
        if (req.id && itemsMap.has(req.id)) {
          itemsMap.get(req.id).usage.quest.push({
            type: 'expedition',
            name: `Expedition Level ${level}`,
            amount: req.amount,
            needed: true,
            details: `Expedition Level ${level}`
          });
        }
      });
    });
  }

  // 4. Process Quests
  questsDb.forEach(quest => {
    if (quest.requirements) {
      quest.requirements.forEach(req => {
        if (req.id && itemsMap.has(req.id)) {
          itemsMap.get(req.id).usage.quest.push({
            type: 'quest',
            name: quest.quest_name,
            amount: req.amount,
            needed: true,
            details: quest.quest_name
          });
        }
      });
    }
  });

  enrichedItemsCache = Array.from(itemsMap.values());
  return enrichedItemsCache;
};

/**
 * Get all quests from the quest database
 * @returns {Array} All quests with their requirements
 */
export const getAllQuests = () => {
  return questsDb.filter(quest => quest.requirements && quest.requirements.length > 0);
};

/**
 * Get all expedition levels from the upgrades database
 * @returns {Array} Expedition levels with requirements
 */
export const getAllExpeditions = () => {
  if (!upgradesDb.expedition_requirements) return [];

  return Object.entries(upgradesDb.expedition_requirements)
    .filter(([, requirements]) => requirements.some(r => r.id)) // Only levels with item requirements
    .map(([levelKey, requirements]) => ({
      level: parseInt(levelKey.replace('level_', '')),
      name: `Expedition Level ${parseInt(levelKey.replace('level_', ''))}`,
      requirements: requirements.filter(r => r.id) // Only item requirements, not currency
    }))
    .sort((a, b) => a.level - b.level);
};

/**
 * Search for items by name (case-insensitive partial match)
 * @param {string} query - Search query
 * @returns {Array} Matching items
 */
export const findItem = (query) => {
  if (!query || query.trim() === '') return [];
  const lowerQuery = query.toLowerCase().trim();
  return getEnrichedItems().filter(item =>
    item.name.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get all items from the database
 * @returns {Array} All items
 */
export const getAllItems = () => getEnrichedItems();

/**
 * Get all unique upgrades available in the database
 * @returns {Array} List of { station, level } objects sorted by station then level
 */
export const getAllUpgrades = () => {
  const upgrades = [];
  if (upgradesDb.station_upgrades) {
    Object.entries(upgradesDb.station_upgrades).forEach(([stationKey, levels]) => {
      const stationName = formatStationName(stationKey);
      Object.keys(levels).forEach(levelKey => {
        const level = parseInt(levelKey.replace('level_', ''));
        upgrades.push({ station: stationName, level });
      });
    });
  }

  return upgrades.sort((a, b) => {
    if (a.station !== b.station) return a.station.localeCompare(b.station);
    return a.level - b.level;
  });
};

/**
 * Get recommendation for an item based on priority logic
 * Priority Order:
 * 1. Quest needed → CRITICAL (red)
 * 2. Upgrade needed (if not completed) → IMPORTANT (orange)
 * 3. Recycle Priority flag → STRATEGIC (purple)
 * 4. Recycle > Sell → PROFIT (green)
 * 5. Sell > Recycle → LIQUIDATE (blue)
 * 6. Equal → NEUTRAL (gray)
 * 
 * @param {Object} item - Item object from database
 * @param {Set<string>} completedUpgrades - Set of "Station-Level" strings that are completed
 * @param {Set<string>} completedQuests - Set of quest/expedition names that are completed
 * @returns {Object} Recommendation with type, label, icon, color, and reason
 */
export const getRecommendation = (item, completedUpgrades = new Set(), completedQuests = new Set()) => {
  // 0. Core Component Priority - DO NOT SELL
  if (item.is_core) {
    return {
      type: 'CRITICAL',
      label: 'CORE COMPONENT',
      icon: '💎',
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.15)',
      reason: 'Essential Crafting Material',
      subtext: 'Never sell - required for numerous recipes'
    };
  }

  // 1. Quest Priority - CRITICAL
  // usage.quest is now an array
  if (item.usage?.quest?.length > 0) {
    // Filter out completed quests/expeditions
    const activeQuests = item.usage.quest.filter(q => !completedQuests.has(q.details));

    if (activeQuests.length > 0) {
      const isExpedition = activeQuests.some(q => q.type === 'expedition');
      const label = isExpedition ? 'EXPEDITION' : 'DO NOT SELL';
      const details = activeQuests.map(q => q.details).join(', ');
      const totalAmount = activeQuests.reduce((sum, q) => sum + q.amount, 0);

      return {
        type: 'CRITICAL',
        label: label,
        icon: '⛔',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.15)',
        reason: `Required for: ${details}`,
        subtext: `Keep at least ${totalAmount}`
      };
    }
  }

  // 2. Upgrade Priority - IMPORTANT
  // Filter out completed upgrades
  const activeUpgrades = item.usage?.upgrade?.filter(u =>
    !completedUpgrades.has(`${u.station}-${u.level}`)
  ) || [];

  if (activeUpgrades.length > 0) {
    const stations = activeUpgrades
      .map(u => `${u.station} Lvl ${u.level}`)
      .join(', ');
    const totalNeeded = activeUpgrades
      .reduce((sum, u) => sum + u.amount, 0);

    return {
      type: 'IMPORTANT',
      label: 'KEEP FOR UPGRADE',
      icon: '🛠️',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      reason: `Workshop Material: ${stations}`,
      subtext: `Total needed: ${totalNeeded}`
    };
  }

  // 3. Donor Priority - STRATEGIC
  if (item.recommendation === 'RECYCLE PRIORITY' || item.recommendation === 'PRIORITY DONOR') {
    return {
      type: 'STRATEGIC',
      label: 'RECYCLE ONLY',
      icon: '♻️',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      reason: `Critical Source for ${item.yields}`,
      subtext: item.notes || 'Do not sell - recycle for rare materials'
    };
  }

  // 4. Financial Calculation (with defensive defaults)
  const recycleValue = item.recycle_value ?? 0;
  const sellPrice = item.sell_price ?? 0;
  const roiPct = item.roi_pct ?? 0;
  const diff = recycleValue - sellPrice;
  const absDiff = Math.abs(diff);

  // 5. Explicit Database Overrides
  if (item.recommendation === 'RECYCLE') {
    const hasFinancials = typeof item.recycle_value !== 'undefined';
    return {
      type: 'PROFIT',
      label: 'RECYCLE',
      icon: '♻️',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.15)',
      reason: `Yields ${item.yields || 'Materials'}`,
      subtext: hasFinancials
        ? (diff >= 0 ? `Profit: +${absDiff} (+${roiPct}%)` : `Strategic Choice (Financially -${absDiff})`)
        : 'Recommended donor for materials'
    };
  }

  if (item.recommendation === 'SELL') {
    const hasFinancials = typeof item.recycle_value !== 'undefined';
    return {
      type: 'LIQUIDATE',
      label: 'SELL',
      icon: '💰',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      reason: `Sell for ${sellPrice.toLocaleString()}`,
      subtext: hasFinancials
        ? (diff < 0 ? `Recycling loses ${absDiff} (${roiPct}%)` : `Database Recommended (Profit lost: ${absDiff})`)
        : 'Recommended for selling'
    };
  }

  if (item.recommendation === 'EITHER') {
    return {
      type: 'NEUTRAL',
      label: 'NEUTRAL',
      icon: '⚖️',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.15)',
      reason: 'Database: Either option is valid',
      subtext: `Sell: ${sellPrice} | Recycle: ${recycleValue}`
    };
  }

  // 6. Financial Fallback (if no explicit recommendation)
  if (diff > 0) {
    // Recycle is better
    return {
      type: 'PROFIT',
      label: 'RECYCLE',
      icon: '♻️',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.15)',
      reason: `Yields ${item.yields || 'Materials'}`,
      subtext: `Profit: +${absDiff} (+${roiPct}%)`
    };
  } else if (diff < 0) {
    // Sell is better
    return {
      type: 'LIQUIDATE',
      label: 'SELL',
      icon: '💰',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      reason: `Sell for ${sellPrice.toLocaleString()}`,
      subtext: `Recycling loses ${absDiff} (${roiPct}%)`
    };
  } else {
    // Equal values
    return {
      type: 'NEUTRAL',
      label: 'NEUTRAL',
      icon: '⚖️',
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.15)',
      reason: 'Equal value either way',
      subtext: `Both options yield ${sellPrice.toLocaleString()}`
    };
  }
};
