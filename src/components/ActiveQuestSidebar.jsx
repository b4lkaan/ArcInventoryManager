import React from 'react';
import './ActiveQuestSidebar.css';

const ActiveQuestSidebar = ({
    isOpen,
    onClose,
    trackedQuests,
    allQuests,
    onRemove
}) => {
    // Filter full quest objects for tracked IDs
    const questsToShow = allQuests.filter(q => trackedQuests.has(q.quest_name));

    if (!isOpen && questsToShow.length === 0) return null;

    return (
        <>
            <div className={`active-quest-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>📌 Active Quests ({questsToShow.length})</h3>
                    <button className="collapse-btn" onClick={onClose}>
                        &times;
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
                            <div key={quest.quest_name} className="active-quest-card">
                                <div className="quest-card-header">
                                    <h4>{quest.quest_name}</h4>
                                    <button
                                        className="remove-btn"
                                        onClick={() => onRemove(quest.quest_name)}
                                        title="Stop Tracking"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <ul className="step-list">
                                    {quest.steps.map((step, idx) => (
                                        <li key={idx} className="step-item">
                                            <span className="step-bullet">•</span>
                                            {step}
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

            {!isOpen && questsToShow.length > 0 && (
                <button
                    className="sidebar-toggle"
                    onClick={onClose} // acts as toggle here since we pass setIsSideBarOpen
                    title="Show Active Quests"
                >
                    📌
                </button>
            )}
        </>
    );
};

export default ActiveQuestSidebar;
