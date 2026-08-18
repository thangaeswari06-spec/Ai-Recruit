import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App crashed:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center" style={{ minHeight: "100vh", justifyContent: "center", gap: 12 }}>
          <p style={{ fontSize: 40 }}>⚠️</p>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h1>
          <p className="text-sm text-muted">{this.state.error.message}</p>
          <button className="btn btn-dark" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}