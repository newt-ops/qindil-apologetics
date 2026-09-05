import { Component, ErrorInfo, ReactNode } from 'react';
import Icon from '../icons/Icon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UNHANDLED REACT ERROR]', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="w-full max-w-md text-center space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Icon name="AlertTriangle" size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unexpected application error occurred. You can reload the application to restore state.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full rounded-lg bg-[#c9a84c] py-2.5 text-xs font-bold text-zinc-950 hover:bg-[#d9b85c] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Icon name="Undo" size={14} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
