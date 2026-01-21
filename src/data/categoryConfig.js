/**
 * Priority Category Configuration
 * Maps category IDs from item_category.json to display properties
 */
export const PRIORITY_CATEGORIES = {
    base_component: {
        label: 'Base Component',
        shortLabel: 'Base',
        icon: '🧱',
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.15)',
        priority: 1
    },
    core_component: {
        label: 'Core Component',
        shortLabel: 'Core',
        icon: '⚙️',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        priority: 2
    },
    high_priority_component: {
        label: 'High Priority',
        shortLabel: 'Priority',
        icon: '⭐',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.15)',
        priority: 3
    },
    donor: {
        label: 'Donor Item',
        shortLabel: 'Donor',
        icon: '♻️',
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.15)',
        priority: 4
    },
    safe_to_sell: {
        label: 'Safe to Sell',
        shortLabel: 'Sellable',
        icon: '💰',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        priority: 5
    }
};

/**
 * Get category config by ID
 * @param {string} categoryId - Category ID from item_category.json
 * @returns {Object|null} Category configuration or null if not found
 */
export const getCategoryConfig = (categoryId) => {
    return PRIORITY_CATEGORIES[categoryId] || null;
};
