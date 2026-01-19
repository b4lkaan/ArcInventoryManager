import React, { useState, useEffect } from 'react';
import { getAllUpgrades } from '../services/dataService';
import { userProgressService } from '../services/userProgressService';
import './UpgradeTracker.css';

const UpgradeTracker = ({ isOpen, onClose, onUpdate }) => {
    const [upgrades, setUpgrades] = useState({});
    const [completed, setCompleted] = useState(new Set());

    useEffect(() => {
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

        setUpgrades(grouped);
        setCompleted(userProgressService.getCompletedUpgrades());
    }, [isOpen]);

    const toggleUpgrade = (station, level, isChecked) => {
        const updated = userProgressService.toggleUpgrade(station, level, isChecked);
        setCompleted(new Set(updated)); // Force re-render
        onUpdate(updated); // Notify parent
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
                                        const isDone = completed.has(`${u.station}-${u.level}`);
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
