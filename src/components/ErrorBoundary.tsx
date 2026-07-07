import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center w-full h-full bg-[#0a0e27]">
          <div className="text-center px-6 py-8 rounded-xl bg-[#0a0e27]/90 border border-white/10 backdrop-blur-md max-w-md">
            <AlertTriangle size={40} className="mx-auto mb-4 text-[#ff6644]" />
            <h2 className="text-base font-semibold text-white mb-2">场景渲染出错</h2>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">
              {this.state.error?.message || '3D场景加载失败，请尝试刷新页面'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00d4ff]/15 text-[#00d4ff] text-sm hover:bg-[#00d4ff]/25 transition-colors border border-[#00d4ff]/20"
            >
              <RefreshCw size={14} />
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}