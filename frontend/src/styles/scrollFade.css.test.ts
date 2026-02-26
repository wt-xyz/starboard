import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'scrollFade.css.ts'), 'utf-8');

describe('scrollFade @supports gate', () => {
  it('every ...hideScrollbar spread is inside an @supports block', () => {
    const lines = source.split('\n');
    const spreads = lines
      .map((l, i) => ({ line: l, index: i }))
      .filter(({ line }) => line.includes('...hideScrollbar'));

    expect(spreads.length).toBeGreaterThan(0);

    for (const { index } of spreads) {
      let supportsIdx = -1;
      for (let i = index - 1; i >= 0; i--) {
        if (lines[i].includes("'@supports'")) {
          supportsIdx = i;
          break;
        }
      }
      expect(supportsIdx).toBeGreaterThanOrEqual(0);

      const region = lines.slice(supportsIdx, index).join('\n');
      const opens = (region.match(/{/g) || []).length;
      const closes = (region.match(/}/g) || []).length;
      expect(opens).toBeGreaterThan(closes);
    }
  });

  it('gates all three style variants and webkitHideScrollbar', () => {
    // 3 style() blocks + 1 webkitHideScrollbar = at least 4 @supports occurrences
    const count = (source.match(/'@supports'/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(4);
  });

  it('no style() call has @media at top level without @supports', () => {
    const styleBlocks = source.match(/style\(\{[\s\S]*?\}\)/g) || [];
    for (const block of styleBlocks) {
      if (block.includes("'@media'")) {
        expect(block).toContain("'@supports'");
      }
    }
  });
});
