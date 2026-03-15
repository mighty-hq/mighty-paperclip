export namespace BrowserExtension {
  export interface Tab {
    active: boolean;
    favicon?: string;
    id: number;
    title?: string;
    url: string;
  }
  export async function getContent(_options?: {
    format?: 'html' | 'text' | 'markdown';
    cssSelector?: string;
    tabId?: number;
  }): Promise<string> {
    return document.documentElement.outerHTML;
  }
  export async function getTabs(): Promise<Tab[]> {
    return [];
  }
}
