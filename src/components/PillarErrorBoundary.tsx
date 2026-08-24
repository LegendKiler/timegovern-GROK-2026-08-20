import React from 'react';

type Props = { children: React.ReactNode; label?: string };
type State = { error: Error | null };

/** Catches render errors so a broken pillar does not show a blank page */
export class PillarErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="rounded-2xl border-2 border-rose-500 bg-slate-950 p-6 text-rose-200"
          style={{ backgroundColor: '#0f172a', color: '#fecdd3', borderColor: '#f43f5e' }}
        >
          <h2 className="text-lg font-bold mb-2">{this.props.label || 'Section'} failed to load</h2>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-48 opacity-90">
            {this.state.error.message}
          </pre>
          <p className="text-xs mt-3 text-slate-400">
            Open browser DevTools (F12) → Console for the full stack. Report this message.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
