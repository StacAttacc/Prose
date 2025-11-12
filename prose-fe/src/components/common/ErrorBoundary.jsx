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

    render() {
        if (this.state.hasError) {
            // Ne pas afficher d'erreur pour le composant Notifications, juste le masquer
            if (this.props.silent) {
                return null;
            }
            
            return (
                <div className="p-2 text-sm text-gray-500">
                    {this.props.fallback || 'Une erreur est survenue'}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

