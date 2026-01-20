import React, { useState } from 'react';
import { getAllQuestsWithSteps, getAllExpeditions } from '../services/dataService';
import { userProgressService } from '../services/userProgressService';
import './QuestTracker.css';

const QuestTracker = ({
    isOpen,
    onClose,
    completedQuests,
    onUpdate,
    trackedQuests,
    onToggleTrack
}) => {
    const [activeTab, setActiveTab] = useState('quests');

    // Use enriched quests with steps
    const [quests] = useState(() => getAllQuestsWithSteps());
    const [expeditions] = useState(() => getAllExpeditions());

    const toggleQuest = (questName, isChecked) => {
        const updated = userProgressService.toggleQuest(questName, isChecked);
        onUpdate(new Set(updated));
    };

    if (!isOpen) return null;

    return (
        <div className="quest-tracker-overlay" onClick={onClose}>
            <div className="quest-tracker-modal" onClick={e => e.stopPropagation()}>
                <div className="quest-tracker-header">
                    <h2>Quest & Expedition Progress</h2>
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
                </div>

                <div className="quest-tracker-content">
                    <p className="tracker-info">
                        Mark completed quests to hide requirements. Pin quests to track them in sidebar.
                    </p>

                    {activeTab === 'quests' && (
                        <div className="quests-list">
                            {quests.map(quest => {
                                const isDone = completedQuests.has(quest.quest_name);
                                const isTracked = trackedQuests?.has(quest.quest_name);

                                return (
                                    <div key={quest.quest_name} className={`quest-item ${isDone ? 'completed' : ''}`}>
                                        <div className="quest-header-row">
                                            <label className="quest-main-check">
                                                <input
                                                    type="checkbox"
                                                    checked={isDone}
                                                    onChange={(e) => toggleQuest(quest.quest_name, e.target.checked)}
                                                />
                                                <span className="quest-name">{quest.quest_name}</span>
                                            </label>

                                            <div className="quest-actions">
                                                {isDone ? (
                                                    <span className="status-tag">DONE</span>
                                                ) : (
                                                    <button
                                                        className={`track-btn ${isTracked ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleTrack(quest.quest_name, !isTracked);
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
                                                        <li key={idx}>• {step}</li>
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
                                    <label key={exp.name} className={`quest-item ${isDone ? 'completed' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={isDone}
                                            onChange={(e) => toggleQuest(exp.name, e.target.checked)}
                                        />
                                        <div className="quest-info">
                                            <span className="quest-name">{exp.name}</span>
                                            <span className="quest-requirements">
                                                {exp.requirements.map(r => `${r.name} x${r.amount}`).join(', ')}
                                            </span>
                                        </div>
                                        {isDone && <span className="status-tag">DONE</span>}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestTracker;
