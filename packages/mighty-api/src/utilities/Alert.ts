import type { ActionStyle } from '../primitives/ActionStyle';
import type { ImageLike } from '../types/image';

export namespace Alert {
  export enum ActionStyle {
    Default = 'default',
    Cancel = 'cancel',
    Destructive = 'destructive',
  }
  export interface ActionOptions {
    onAction?: () => void;
    style?: ActionStyle;
    title: string;
  }
  export interface Options {
    dismissAction?: ActionOptions;
    icon?: ImageLike;
    message?: string;
    primaryAction?: ActionOptions;
    rememberUserChoice?: boolean;
    title: string;
  }
}
