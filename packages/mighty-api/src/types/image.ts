import type { Icon } from '../primitives/Icon';
import type { Color } from '../primitives/Color';
import type { PathLike } from './common';

export interface FileIcon {
  fileIcon: PathLike;
  fileType?: string;
}

export interface ImageDynamic {
  adjustContrast?: boolean | null;
  dark: string;
  light: string;
}

export enum ImageMask {
  Circle = 'circle',
  RoundedRectangle = 'roundedRectangle',
}

export type ImageURL = string;
export type ImageAsset = string;

export type ImageSource = ImageURL | ImageAsset | Icon | { light: ImageURL | ImageAsset; dark: ImageURL | ImageAsset };

export type ImageFallback = ImageAsset | Icon | { light: ImageAsset; dark: ImageAsset };

export interface ImageObject {
  fallback?: ImageFallback | undefined | null;
  mask?: ImageMask | undefined | null;
  source: ImageSource;
  tintColor?: Color.ColorLike | undefined | null;
}

export type ImageLike = ImageURL | ImageAsset | Icon | FileIcon | ImageObject;
