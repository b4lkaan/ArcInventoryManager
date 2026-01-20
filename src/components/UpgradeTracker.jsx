import React, { useState } from 'react';
import { getAllUpgrades } from '../services/dataService';
import { userProgressService } from '../services/userProgressService';
import './UpgradeTracker.css';

const UpgradeTracker = ({ isOpen, onClose, completedUpgrades, onUpdate }) => {
    const [upgrades] = useState(() => {
        // Group upgrades by station
        const allUpgrades = getAllUpgrades();
        const grouped = allUpgrades.reduce((acc, u) => {
            if (!acc[u.station]) acc[u.station] = [];
            acc[u.station].push(u);
            return acc;
        }, {});

        // Sort levels
        Object.keys(grouped).forEach(station => {
            grouped[station].sort((a, b) => a.level - b.level);
        });
        return grouped;
    });

    // Sync when modal opens if needed, but since we modify shared state up top, this local state sync pattern works better if we just init once 
    // or rely on parent props. However, the current component manages its own 'completed' state copy.
    // Let's rely on init for now as isOpen triggers mount in conditional rendering typically, 
    // but here it is always rendered but hidden via CSS or null?
    // Looking at App.jsx: default is {isTrackerOpen} which renders <UpgradeTracker isOpen={...} />
    // If it's always mounted, we need useEffect to sync when isOpen changes to true.
    // BUT the error says synchronous setState in effect.
    // Solution: access service directly in render or use effect correctly.
    // Actually, getting data from localStorage is synchronous.
    // If this component stays mounted, we do need to refresh data when it opens.
    // The lint error happens because we set state immediately in effect.

    // Better pattern: Only sync when opening, but wrapped in immediate check or use key-based remounting in App.js
    // For now, let's fix the lint by initializing lazily and using a better effect pattern if updates are needed.
    // If the component is always mounted, we need an effect. 
    // We can avoid the lint error by not running it on every render, but we depend on isOpen.

    // Simplest fix for the specific error "state update in effect":
    // The error complains about synchronous execution. 
    // IF we really need to sync on open:

    const toggleUpgrade = (station, level, isChecked) => {
        const updated = userProgressService.toggleUpgrade(station, level, isChecked);
        onUpdate(new Set(updated)); // Notify parent
    };

    if (!isOpen) return null;

    return (
        <div className="upgrade-tracker-overlay" onClick={onClose}>
            <div className="upgrade-tracker-modal" onClick={e => e.stopPropagation()}>
                <div className="upgrade-tracker-header">
                    <h2>Workshop Upgrades</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="upgrade-tracker-content">
                    <p className="tracker-info">
                        Mark upgrades as completed to update item recommendations.
                        Items required for completed upgrades will no longer trigger "KEEP FOR UPGRADE" alerts.
                    </p>

                    <div className="stations-grid">
                        {Object.entries(upgrades).map(([station, levels]) => (
                            <div key={station} className="station-card">
                                <h3>{station}</h3>
                                <div className="levels-list">
                                    {levels.map(u => {
                                        const isDone = completedUpgrades.has(`${u.station}-${u.level}`);
                                        return (
                                            <label key={u.level} className={`level-item ${isDone ? 'completed' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isDone}
                                                    onChange={(e) => toggleUpgrade(u.station, u.level, e.target.checked)}
                                                />
                                                <span className="level-label">Level {u.level}</span>
                                                {isDone && <span className="status-tag">DONE</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeTracker;
