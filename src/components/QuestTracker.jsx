import React, { useState } from 'react';
import { getAllQuests, getAllExpeditions } from '../services/dataService';
import { userProgressService } from '../services/userProgressService';
import './QuestTracker.css';

const QuestTracker = ({ isOpen, onClose, completedQuests, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('quests');

    const [quests] = useState(() => getAllQuests());
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
                        Mark completed quests/expeditions to remove their item requirements from recommendations.
                    </p>

                    {activeTab === 'quests' && (
                        <div className="quests-list">
                            {quests.map(quest => {
                                const isDone = completedQuests.has(quest.quest_name);
                                return (
                                    <label key={quest.quest_name} className={`quest-item ${isDone ? 'completed' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={isDone}
                                            onChange={(e) => toggleQuest(quest.quest_name, e.target.checked)}
                                        />
                                        <div className="quest-info">
                                            <span className="quest-name">{quest.quest_name}</span>
                                            <span className="quest-requirements">
                                                {quest.requirements.map(r => `${r.name} x${r.amount}`).join(', ')}
                                            </span>
                                        </div>
                                        {isDone && <span className="status-tag">DONE</span>}
                                    </label>
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
