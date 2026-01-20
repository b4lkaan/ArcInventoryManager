import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedValue } from '../utils/localization';
import './ActiveQuestSidebar.css';

const ActiveQuestSidebar = ({
    isOpen,
    onClose,
    trackedQuests,
    allQuests,
    onRemove
}) => {
    const { language } = useLanguage();
    // Filter full quest objects for tracked IDs (use English name for key matching)
    const questsToShow = allQuests.filter(q => trackedQuests.has(getLocalizedValue(q.quest_name, 'en')));

    // Don't show anything if there are no tracked quests
    if (questsToShow.length === 0) return null;

    // Minimized view - compact header bar
    if (!isOpen) {
        return (
            <div className="active-quest-sidebar minimized" onClick={onClose}>
                <div className="sidebar-header minimized-header">
                    <h3>📌 Active Quests ({questsToShow.length})</h3>
                    <span className="expand-icon">▲</span>
                </div>
            </div>
        );
    }

    return (
        <div className="active-quest-sidebar open">
            <div className="sidebar-header">
                <h3>📌 Active Quests ({questsToShow.length})</h3>
                <button className="collapse-btn" onClick={onClose} title="Minimize">
                    ▼
                </button>
            </div>

            <div className="sidebar-content">
                {questsToShow.length === 0 ? (
                    <div className="empty-state">
                        No active quests tracked.<br />
                        Add quests from the Quest Tracker "📜" menu.
                    </div>
                ) : (
                    questsToShow.map(quest => (
                        <div key={getLocalizedValue(quest.quest_name, 'en')} className="active-quest-card">
                            <div className="quest-card-header">
                                <h4>{getLocalizedValue(quest.quest_name, language)}</h4>
                                <button
                                    className="remove-btn"
                                    onClick={() => onRemove(getLocalizedValue(quest.quest_name, 'en'))}
                                    title="Stop Tracking"
                                >
                                    &times;
                                </button>
                            </div>

                            <ul className="step-list">
                                {quest.steps.map((step, idx) => (
                                    <li key={idx} className="step-item">
                                        <span className="step-bullet">•</span>
                                        {getLocalizedValue(step, language)}
                                    </li>
                                ))}
                            </ul>

                            {quest.requirements && quest.requirements.length > 0 && (
                                <div className="req-list">
                                    {quest.requirements.map((req, i) => (
                                        <span key={i} className="req-tag">
                                            {req.name}: {req.amount}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActiveQuestSidebar;
