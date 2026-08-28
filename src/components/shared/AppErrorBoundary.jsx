import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Centralized integration point for future server-side observability.
    console.error('Unexpected application error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="app-state app-state-error" role="alert">
        <AlertTriangle aria-hidden="true" size={24} />
        <h1>Ghost Guardian could not load this screen.</h1>
        <p>Your demo workspace is unchanged. Return home and try again.</p>
        <a className="button button-secondary" href="/">Return home</a>
      </main>
    );
  }
}

