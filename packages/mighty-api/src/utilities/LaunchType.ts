import type { FormValues_2 } from './FormTypes';
export enum LaunchType {
  UserInitiated = 'userInitiated',
  Background = 'background',
}
export declare function launchCommand(options: LaunchOptions): Promise<void>;

export interface LaunchContext {
  /**
   * The context values for a command launch.
   */
  [item: string]: any;
}

/**
 * Options for launching a command from the same extension or from another extension.
 */
export type LaunchOptions = IntraExtensionLaunchOptions | InterExtensionLaunchOptions;
export interface Arguments {
  /**
   * The representation of arguments given that key here is the `name` defined in manifest file and value is the user's input
   */
  [item: string]: any;
}
export type InterExtensionLaunchOptions = {
  /** When launching command from a different extension, the owner or author (as defined in the extension's manifest) is necessary */
  ownerOrAuthorName: string;
  /** When launching command from a different extension, the extension name (as defined in the extension's manifest) is necessary */
  extensionName: string;
  /** Command name as defined in the extension's manifest */
  name: string;
  /** {@link LaunchType.UserInitiated} or {@link LaunchType.Background} */
  type: LaunchType;
  /** Optional object for the argument properties and values as defined in the extension's manifest, for example: `{ "argument1": "value1" }` */
  arguments?: Arguments | null;
  /** Arbitrary object for custom data that should be passed to the command and accessible as {@link LaunchProps}; the object must be JSON serializable (Dates and Buffers supported) */
  context?: LaunchContext | null;
  /** Optional string to send as fallback text to the command */
  fallbackText?: string | null;
};
/**
 * The top-level props that a Command receives on launch
 */
type IntraExtensionLaunchOptions = {
  /** Command name as defined in the extension's manifest */
  name: string;
  /** {@link LaunchType.UserInitiated} or {@link LaunchType.Background} */
  type: LaunchType;
  /** Optional object for the argument properties and values as defined in the extension's manifest, for example: `{ "argument1": "value1" }` */
  arguments?: Arguments | null;
  /** Arbitrary object for custom data that should be passed to the command and accessible as {@link LaunchProps}; the object must be JSON serializable (Dates and Buffers supported) */
  context?: LaunchContext | null;
  /** Optional string to send as fallback text to the command */
  fallbackText?: string | null;
};
export declare type LaunchProps<
  T extends {
    arguments?: Arguments;
    draftValues?: FormValues_2;
    launchContext?: LaunchContext;
  } = {
    arguments: Arguments;
    draftValues: FormValues_2;
    launchContext?: LaunchContext;
  },
> = {
  /**
   * The type of launch for the command (user initiated or background).
   */
  launchType: LaunchType;
  /**
   * Use these values to populate the initial state for your command.
   */
  arguments: T['arguments'];
  /**
   * When a user enters the command via a draft, this object will contain the user inputs that were saved as a draft.
   * Use its values to populate the initial state for your Form.
   */
  draftValues?: T['draftValues'];
  /**
   * When the command is launched programmatically via `launchCommand`, this object contains the value passed to `context`.
   */
  launchContext?: T['launchContext'];
  /**
   * When the command is launched as a fallback command, this string contains the text of the root search.
   */
  fallbackText?: string;
};
