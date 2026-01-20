import { getRecommendation } from '../services/dataService';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedValue } from '../utils/localization';
import VerdictBanner from './VerdictBanner';
import './ItemCard.css';

export default function ItemCard({ item, onBack, completedUpgrades = new Set(), completedQuests = new Set() }) {
    const { language } = useLanguage();
    const recommendation = getRecommendation(item, completedUpgrades, completedQuests);

    return (
        <div className="item-card">
            {/* Header */}
            <div className="card-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Search
                </button>
                <div className="item-title">
                    {item.image && (
                        <img
                            src={item.image}
                            alt={getLocalizedValue(item.name, language)}
                            className="item-header-image"
                        />
                    )}
                    <h1>{getLocalizedValue(item.name, language)}</h1>
                    <span className="category-badge">{item.category}</span>
                </div>
            </div>

            {/* Main Verdict Banner */}
            <VerdictBanner recommendation={recommendation} />

            {/* Details Grid */}
            <div className="details-grid">
                {/* Financial Details */}
                <div className="detail-section">
                    <h3 className="section-title">💵 Financial Analysis</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Sell Price</span>
                            <span className="stat-value sell">{(item.sell_price ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Recycle Value</span>
                            <span className="stat-value recycle">
                                {typeof item.recycle_value !== 'undefined' ? item.recycle_value.toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">ROI %</span>
                            <span className={`stat-value ${(item.roi_pct ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                                {typeof item.roi_pct !== 'undefined' ? `${item.roi_pct >= 0 ? '+' : ''}${item.roi_pct}%` : 'N/A'}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Yields</span>
                            <span className="stat-value yields">{item.yields || 'None'}</span>
                        </div>
                    </div>
                </div>

                {/* Usage Details */}
                <div className="detail-section">
                    <h3 className="section-title">📋 Usage & Dependencies</h3>

                    {/* Quest Usage */}
                    <div className="usage-block">
                        <h4>Quest / Expedition Requirements</h4>
                        {item.usage?.quest?.length > 0 ? (
                            <div className="quest-list">
                                {item.usage.quest.map((quest, index) => {
                                    const isComplete = completedQuests.has(quest.details);
                                    return (
                                        <div key={index} className={`usage-item ${isComplete ? 'completed' : 'critical'}`}>
                                            <span className="usage-icon">
                                                {isComplete ? '✅' : (quest.type === 'expedition' ? '📦' : '⛔')}
                                            </span>
                                            <div className="usage-info">
                                                <span className="usage-primary">
                                                    {quest.details}
                                                    {isComplete && <span className="completed-badge">COMPLETED</span>}
                                                </span>
                                                <span className="usage-secondary">Amount needed: {quest.amount}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="no-usage">✓ Not required for any quest</p>
                        )}
                    </div>

                    {/* Upgrade Usage */}
                    <div className="usage-block">
                        <h4>Workshop Upgrades</h4>
                        {item.usage?.upgrade?.length > 0 ? (
                            <div className="upgrade-list">
                                {item.usage.upgrade.map((upgrade, index) => {
                                    const isComplete = completedUpgrades.has(`${upgrade.station}-${upgrade.level}`);
                                    return (
                                        <div key={index} className={`usage-item upgrade ${isComplete ? 'completed' : ''}`}>
                                            <span className="usage-icon">{isComplete ? '✅' : '🛠️'}</span>
                                            <div className="usage-info">
                                                <span className="usage-primary">
                                                    {upgrade.station} Level {upgrade.level}
                                                    {isComplete && <span className="completed-badge">COMPLETED</span>}
                                                </span>
                                                <span className="usage-secondary">Amount: {upgrade.amount}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="no-usage">✓ Not required for any upgrades</p>
                        )}
                    </div>

                    {/* Notes */}
                    {item.notes && (
                        <div className="usage-block notes">
                            <h4>Strategic Notes</h4>
                            <p className="notes-text">💡 {item.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
