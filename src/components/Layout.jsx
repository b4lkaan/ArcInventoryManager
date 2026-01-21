import React from 'react';
import LanguageSelector from './LanguageSelector';

const Layout = ({ children, onOpenProgression }) => {
    return (
        <div className="app">
            {/* Background decoration */}
            <div className="bg-decoration">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
                <div className="bg-orb bg-orb-3"></div>
            </div>

            <header className="app-header">
                <div className="header-content">
                    <div className="logo-group">
                        <div className="logo">
                            <span className="logo-icon">⚡</span>
                            <h1>ARC Raiders</h1>
                        </div>
                        <p className="tagline">Item Analyzer</p>
                    </div>
                    <div className="header-buttons">
                        <LanguageSelector />
                        <button
                            className="quest-btn"
                            onClick={onOpenProgression}
                        >
                            📋 Progression
                        </button>
                    </div>
                </div>
            </header>

            <main className="app-main">
                {children}
            </main>

            <footer className="app-footer">
                <p>Keep • Sell • Recycle — Make the right choice</p>
            </footer>
        </div>
    );
};

export default Layout;
