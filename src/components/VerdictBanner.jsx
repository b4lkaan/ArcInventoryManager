import './VerdictBanner.css';

export default function VerdictBanner({ recommendation }) {
    const { icon, label, reason, subtext, color, bgColor, type } = recommendation;

    return (
        <div
            className={`verdict-banner ${type.toLowerCase()}`}
            style={{
                '--verdict-color': color,
                '--verdict-bg': bgColor
            }}
        >
            <div className="verdict-main">
                <span className="verdict-icon">{icon}</span>
                <span className="verdict-label">{label}</span>
            </div>
            <div className="verdict-details">
                <p className="verdict-reason">{reason}</p>
                <p className="verdict-subtext">{subtext}</p>
            </div>
        </div>
    );
}
