import type { Icon } from '../primitives/Icon';
import type { Color } from '../primitives/Color';
import { ImageMask, type FileIcon, type ImageDynamic, type ImageObject } from '../types/image';

/**
 * Mighty-compatible Image interface.
 * Represents an image with source, optional fallback, mask, and tint color.
 */
export interface Image {
  fallback?: Image.Fallback | undefined | null;
  mask?: Image.Mask | undefined | null;
  source: Image.Source;
  tintColor?: Color.ColorLike | undefined | null;
}

export namespace Image {
  export type URL = string;
  export type Asset = string;

  export type Source = URL | Asset | Icon | { light: URL | Asset; dark: URL | Asset };

  export type Fallback = Asset | Icon | { light: Asset; dark: Asset };

  export type ImageLike = URL | Asset | Icon | FileIcon | Image;

  export type Dynamic = ImageDynamic;

  export const Mask = ImageMask;
  export type Mask = ImageMask;
}
