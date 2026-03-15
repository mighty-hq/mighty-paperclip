export interface ClipboardEntry {
  appSource?: string;
  content: string;
  contentType: 'text' | 'image' | 'html';
  id: string;
  preview: string;
  timestamp: number;
}
