"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
            <AlertTriangle className="size-7" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-bold">
              Algo deu errado
            </h2>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
              {this.state.error?.message ??
                "Ocorreu um erro inesperado ao carregar esta página."}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <RefreshCw className="size-4" />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
