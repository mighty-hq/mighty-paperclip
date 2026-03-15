import type { PluginManifest } from '../plugins/types';
import { calculatorPlugin } from '../plugins/calculator/index';
import { colorPickerPlugin } from '../plugins/colorPicker/index';
import { appLauncherPlugin } from './app-launcher/index';
import { bookmarksPlugin } from './bookmarks/index';
import { aiCommandsPlugin } from './aicommands/index';
import { mightyAiPlugin } from './mighty-ai/index';
import { loremIpsumPlugin } from './loremIpsum/index';
import { exampleExtensionPlugin } from './example-extension/index';
import { fullExtensionPlugin } from './full-extension/index';

export const builtinPlugins: PluginManifest[] = [
  calculatorPlugin,
  colorPickerPlugin,
  appLauncherPlugin,
  bookmarksPlugin,
  aiCommandsPlugin,
  mightyAiPlugin,
  loremIpsumPlugin,
  exampleExtensionPlugin,
  fullExtensionPlugin,
];
