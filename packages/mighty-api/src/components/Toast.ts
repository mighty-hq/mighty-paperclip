export namespace Toast {
  export enum Style {
    Success = 'SUCCESS',
    Failure = 'FAILURE',
    Animated = 'ANIMATED',
  }

  export interface ActionOptions {
    onAction: (toast: ToastInstance) => void;
    shortcut?: unknown;
    title: string;
  }

  export interface Options {
    message?: string;
    primaryAction?: ActionOptions;
    secondaryAction?: ActionOptions;
    style?: Style;
    title: string;
  }
}

export interface ToastInstance {
  hide(): Promise<void>;
  message?: string;
  show(): Promise<void>;
  style: Toast.Style;
  title: string;
}
