import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { componentize } from './componentize';

const styles = { myBox: 'style-my-box' };

describe('componentize', () => {
  it('creates a component that renders a custom element with the style class', () => {
    const $$ = componentize(styles);
    const { container } = render(<$$.myBox />);

    const el = container.firstElementChild!;
    expect(el.tagName.toLowerCase()).toBe('s-my-box');
    expect(el.className).toBe('style-my-box');
  });

  it('does not throw when a symbol key is accessed', () => {
    const $$ = componentize(styles);

    expect(() => ($$ as Record<symbol, unknown>)[Symbol.toStringTag]).not.toThrow();
    expect(($$ as Record<symbol, unknown>)[Symbol.iterator]).toBeUndefined();
  });
});
