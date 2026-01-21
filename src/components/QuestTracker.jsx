import React, { useState, useMemo } from 'react';
import { getAllQuestsWithSteps, getAllExpeditions, getAllUpgrades } from '../services/dataService';
import { useUserProgress } from '../context/UserProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedValue } from '../utils/localization';
import './QuestTracker.css';

const QuestTracker = ({
    isOpen,
    onClose
}) => {
    const {
        completedQuests,
        toggleQuest,
        trackedQuests,
        toggleTrackedQuest,
        completedUpgrades,
        toggleUpgrade
    } = useUserProgress();

    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState('quests');

    // Fetch data fresh each time the modal opens (useMemo recalculates when isOpen changes)
    const quests = useMemo(() => isOpen ? getAllQuestsWithSteps() : [], [isOpen]);
    const expeditions = useMemo(() => isOpen ? getAllExpeditions() : [], [isOpen]);
    const upgrades = useMemo(() => {
        if (!isOpen) return {};
        // Group upgrades by station for display
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
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="quest-tracker-overlay" onClick={onClose}>
            <div className="quest-tracker-modal" onClick={e => e.stopPropagation()}>
                <div className="quest-tracker-header">
                    <h2>Progression Tracker</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="quest-tracker-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'quests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quests')}
                    >
                        📜 Quests ({quests.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'expeditions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('expeditions')}
                    >
                        📦 Expeditions ({expeditions.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'upgrades' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upgrades')}
                    >
                        🛠️ Upgrades
                    </button>
                </div>

                <div className="quest-tracker-content">
                    <p className="tracker-info">
                        Mark completed items to remove them from recommendations. Pin active quests to the sidebar.
                    </p>

                    {activeTab === 'quests' && (
                        <div className="quests-list">
                            {quests.map(quest => {
                                const questKey = getLocalizedValue(quest.quest_name, 'en');
                                const isDone = completedQuests.has(questKey);
                                const isTracked = trackedQuests?.has(questKey);

                                return (
                                    <div key={questKey} className={`quest-item ${isDone ? 'completed' : ''}`}>
                                        <div className="quest-header-row">
                                            <label className="quest-main-check">
                                                <input
                                                    type="checkbox"
                                                    checked={isDone}
                                                    onChange={(e) => toggleQuest(questKey, e.target.checked)}
                                                />
                                                <span className="quest-name">{getLocalizedValue(quest.quest_name, language)}</span>
                                            </label>

                                            <div className="quest-actions">
                                                {isDone ? (
                                                    <span className="status-tag">DONE</span>
                                                ) : (
                                                    <button
                                                        className={`track-btn ${isTracked ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTrackedQuest(questKey, !isTracked);
                                                        }}
                                                        title={isTracked ? "Stop Tracking" : "Track in Sidebar"}
                                                    >
                                                        {isTracked ? '📌 Pinned' : '📌 Pin'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="quest-details">
                                            {quest.steps.length > 0 && (
                                                <ul className="quest-steps-list">
                                                    {quest.steps.map((step, idx) => (
                                                        <li key={idx}>• {getLocalizedValue(step, language)}</li>
                                                    ))}
                                                </ul>
                                            )}

                                            {quest.requirements && quest.requirements.length > 0 && (
                                                <div className="quest-requirements-tags">
                                                    <span className="req-label">Needs: </span>
                                                    {quest.requirements.map((r, i) => (
                                                        <span key={i} className="req-pill">
                                                            {r.name} x{r.amount}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'expeditions' && (
                        <div className="expeditions-list">
                            {expeditions.map(exp => {
                                const isDone = completedQuests.has(exp.name);
                                return (
                                    <div key={exp.name} className={`quest-item expedition-item ${isDone ? 'completed' : ''}`}>
                                        <div className="quest-header-row">
                                            <label className="quest-main-check">
                                                <input
                                                    type="checkbox"
                                                    checked={isDone}
                                                    onChange={(e) => toggleQuest(exp.name, e.target.checked)}
                                                />
                                                <span className="quest-name">{exp.name}</span>
                                            </label>
                                            {isDone && <span className="status-tag">DONE</span>}
                                        </div>

                                        <div className="quest-details">
                                            <ul className="quest-steps-list">
                                                {exp.requirements.map((req, idx) => (
                                                    <li key={idx}>
                                                        • {req.is_currency
                                                            ? `${req.name}: ${req.amount.toLocaleString()}`
                                                            : req.is_task
                                                                ? req.name
                                                                : `${req.name} x${req.amount}`
                                                        }
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'upgrades' && (
                        <div className="stations-grid">
                            {Object.entries(upgrades).map(([station, levels]) => (
                                <div key={station} className="station-card">
                                    <h3>{station}</h3>
                                    <div className="levels-list">
                                        {levels.map(u => {
                                            const isDone = completedUpgrades?.has(`${u.station}-${u.level}`);
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestTracker;
