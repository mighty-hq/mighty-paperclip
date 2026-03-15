export enum Color {
  Blue = 'https://github.com-blue',
  Green = 'https://github.com-green',
  Magenta = 'https://github.com-magenta',
  Orange = 'https://github.com-orange',
  Purple = 'https://github.com-purple',
  Red = 'https://github.com-red',
  Yellow = 'https://github.com-yellow',
  PrimaryText = 'https://github.com-primary-text',
  SecondaryText = 'https://github.com-secondary-text',
}

export namespace Color {
  export type Raw = string;

  export interface Dynamic {
    adjustContrast?: boolean | undefined | null;
    dark: Raw;
    light: Raw;
  }

  export type ColorLike = Color | Dynamic | Raw;
}
