import React from 'react';

const LoadingScreen = ({ status }) => {
    return (
        <div className="loading-screen" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
            color: '#fff'
        }}>
            <div className="loading-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h2 style={{ margin: '0 0 1rem 0', fontWeight: '300' }}>ARC Raiders Item Analyzer</h2>
            <div className="spinner" style={{ margin: '20px', fontSize: '2rem' }}>♻️</div>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>{status}</p>
        </div>
    );
};

export default LoadingScreen;
