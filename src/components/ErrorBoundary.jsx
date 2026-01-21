import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided, otherwise default
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary-fallback" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'rgba(220, 38, 38, 0.1)',
                    borderRadius: '12px',
                    margin: '1rem',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                    <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
                        ⚠️ Something went wrong
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                        {this.props.message || 'An unexpected error occurred in this section.'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--accent-blue, #3b82f6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
