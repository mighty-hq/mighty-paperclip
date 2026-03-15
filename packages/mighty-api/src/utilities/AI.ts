export namespace AI {
  export type Creativity = 'none' | 'low' | 'medium' | 'high' | 'maximum' | number;
  export enum Model {
    OpenAI_GPT4o_mini = 'openai-gpt-4o-mini',
    OpenAI_GPT4o = 'openai-gpt-4o',
  }
  export interface AskOptions {
    creativity?: Creativity;
    model?: Model;
    signal?: AbortSignal;
  }
  export function ask(
    _prompt: string,
    _options?: AskOptions
  ): Promise<string> & { on(event: 'data', listener: (chunk: string) => void): void } {
    const p = Promise.resolve('(AI unavailable in browser context)') as Promise<string> & {
      on: (event: string, listener: (chunk: string) => void) => void;
    };
    p.on = () => {};
    return p;
  }
}
