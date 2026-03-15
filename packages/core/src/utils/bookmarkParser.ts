// Parse standard Netscape Bookmark File Format (Chrome/Firefox/Safari export)

export interface ParsedBookmark {
  addDate?: number;
  folder: string;
  selected: boolean;
  title: string;
  url: string;
}

export function parseBookmarksHtml(html: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function walk(node: Element, folder: string) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.tagName === 'DT') {
        const h3 = child.querySelector(':scope > H3');
        if (h3) {
          // It's a folder — recurse into the next DL
          const dl = child.querySelector(':scope > DL');
          if (dl) walk(dl, folder ? `${folder} / ${h3.textContent?.trim() || ''}` : h3.textContent?.trim() || '');
          continue;
        }

        const a = child.querySelector(':scope > A');
        if (a) {
          const href = a.getAttribute('HREF') || a.getAttribute('href') || '';
          const title = a.textContent?.trim() || href;
          const addDate = parseInt(a.getAttribute('ADD_DATE') || '0', 10) || undefined;
          if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            bookmarks.push({ title, url: href, folder: folder || 'Uncategorized', addDate, selected: true });
          }
        }
      }
    }
  }

  // Find the root DL element
  const rootDl = doc.querySelector('DL, dl');
  if (rootDl) {
    walk(rootDl, '');
  }

  return bookmarks;
}
