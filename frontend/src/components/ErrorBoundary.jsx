import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#d32f2f' }}>Something went wrong</h1>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}
          >
            Reload
          </button>
          {import.meta.env.DEV && this.state.error && (
            <div style={{ marginTop: '30px', textAlign: 'left', background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
              <p><strong>Development Error:</strong></p>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#333' }}>
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}
