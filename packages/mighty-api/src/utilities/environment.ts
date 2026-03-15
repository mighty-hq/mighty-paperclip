import { LaunchType } from './LaunchType';
export interface Environment {
  appearance: 'dark' | 'light';
  assetsPath: string;

  commandMode: 'view' | 'no-view' | 'menu-bar';
  commandName: string;
  extensionName: string;
  isDevelopment: boolean;
  launchType: 'userInitiated' | 'background';
  mightyVersion: string;
  supportPath: string;
  textSize: 'small' | 'medium' | 'large';
}

export const environment: Environment = {
  appearance: 'dark',
  assetsPath: '',
  mightyVersion: '1.0.0',
  extensionName: 'mightyhq',
  commandName: 'command',
  commandMode: 'view',
  isDevelopment: (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') || false,
  launchType: 'background',
  textSize: 'medium',
  supportPath: '',
};
