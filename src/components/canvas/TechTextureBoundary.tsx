import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type TechTextureBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type TechTextureBoundaryState = {
  failed: boolean;
};

export class TechTextureBoundary extends Component<
  TechTextureBoundaryProps,
  TechTextureBoundaryState
> {
  state: TechTextureBoundaryState = { failed: false };

  static getDerivedStateFromError(): TechTextureBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Tech icon texture failed to load.", error, info);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default TechTextureBoundary;
