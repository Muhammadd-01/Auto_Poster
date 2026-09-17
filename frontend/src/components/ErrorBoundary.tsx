import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-amber-50/40 flex flex-col justify-center items-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-orange-950/10 border border-orange-100/80 text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-orange-50/50 border border-orange-100 text-left overflow-auto max-h-32 text-xs text-orange-900 font-mono">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2 transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center justify-center space-x-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
