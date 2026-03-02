import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

const FADE = '64px';
const TOUCH = '(pointer: coarse)';
const SUPPORTS_SCROLL_ANIMATION = '(animation-timeline: scroll(self block))';

// CSS variables driven by scroll-driven animations.
// Default 0px = no fade (used when content doesn't overflow).
const fadeTop = createVar();
const fadeBottom = createVar();
const fadeLeft = createVar();
const fadeRight = createVar();

const hideScrollbar = {
  scrollbarWidth: 'none',
} as const;

// Vertical: at 0% scroll no top fade; at 100% no bottom fade
const fadeAnimY = keyframes({
  '0%': { vars: { [fadeTop]: '0px', [fadeBottom]: FADE } },
  '1%': { vars: { [fadeTop]: FADE, [fadeBottom]: FADE } },
  '99%': { vars: { [fadeTop]: FADE, [fadeBottom]: FADE } },
  '100%': { vars: { [fadeTop]: FADE, [fadeBottom]: '0px' } },
});

// Vertical bottom-only: no top fade ever; at 100% no bottom fade
const fadeAnimBottom = keyframes({
  '0%': { vars: { [fadeBottom]: FADE } },
  '99%': { vars: { [fadeBottom]: FADE } },
  '100%': { vars: { [fadeBottom]: '0px' } },
});

// Horizontal: at 0% scroll no left fade; at 100% no right fade
const fadeAnimX = keyframes({
  '0%': { vars: { [fadeLeft]: '0px', [fadeRight]: FADE } },
  '1%': { vars: { [fadeLeft]: FADE, [fadeRight]: FADE } },
  '99%': { vars: { [fadeLeft]: FADE, [fadeRight]: FADE } },
  '100%': { vars: { [fadeLeft]: FADE, [fadeRight]: '0px' } },
});

export const scrollFadeY = style({
  vars: { [fadeTop]: '0px', [fadeBottom]: '0px' },
  '@supports': {
    [SUPPORTS_SCROLL_ANIMATION]: {
      '@media': {
        [TOUCH]: {
          ...hideScrollbar,
          maskImage: [
            `linear-gradient(to bottom, transparent, black ${fadeTop}, black calc(100% - ${fadeBottom}), transparent)`,
            'linear-gradient(black, black)',
          ].join(', '),
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
          animationName: fadeAnimY,
          animationTimingFunction: 'linear',
          animationTimeline: 'scroll(self block)',
        },
      },
    },
  },
});

const webkitHideScrollbar = {
  '@supports': {
    [SUPPORTS_SCROLL_ANIMATION]: {
      '@media': {
        [TOUCH]: {
          display: 'none' as const,
        },
      },
    },
  },
};

globalStyle(`${scrollFadeY}::-webkit-scrollbar`, webkitHideScrollbar);

export const scrollFadeX = style({
  vars: { [fadeLeft]: '0px', [fadeRight]: '0px' },
  '@supports': {
    [SUPPORTS_SCROLL_ANIMATION]: {
      '@media': {
        [TOUCH]: {
          ...hideScrollbar,
          maskImage: [
            'linear-gradient(black, black)',
            `linear-gradient(to right, transparent, black ${fadeLeft}, black calc(100% - ${fadeRight}), transparent)`,
          ].join(', '),
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
          animationName: fadeAnimX,
          animationTimingFunction: 'linear',
          animationTimeline: 'scroll(self inline)',
        },
      },
    },
  },
});

globalStyle(`${scrollFadeX}::-webkit-scrollbar`, webkitHideScrollbar);

export const scrollFadeXY = style({
  vars: {
    [fadeTop]: '0px',
    [fadeBottom]: '0px',
    [fadeLeft]: '0px',
    [fadeRight]: '0px',
  },
  '@supports': {
    [SUPPORTS_SCROLL_ANIMATION]: {
      '@media': {
        [TOUCH]: {
          ...hideScrollbar,
          maskImage: [
            `linear-gradient(to bottom, transparent, black ${fadeTop}, black calc(100% - ${fadeBottom}), transparent)`,
            `linear-gradient(to right, transparent, black ${fadeLeft}, black calc(100% - ${fadeRight}), transparent)`,
          ].join(', '),
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
          animationName: `${fadeAnimY}, ${fadeAnimX}`,
          animationTimingFunction: 'linear, linear',
          animationTimeline: 'scroll(self block), scroll(self inline)',
        },
      },
    },
  },
});

globalStyle(`${scrollFadeXY}::-webkit-scrollbar`, webkitHideScrollbar);

// Bottom + horizontal: no top fade (preserves sticky headers / tab bars)
export const scrollFadeBottomX = style({
  vars: {
    [fadeBottom]: '0px',
    [fadeLeft]: '0px',
    [fadeRight]: '0px',
  },
  '@supports': {
    [SUPPORTS_SCROLL_ANIMATION]: {
      '@media': {
        [TOUCH]: {
          ...hideScrollbar,
          maskImage: [
            `linear-gradient(to bottom, black, black calc(100% - ${fadeBottom}), transparent)`,
            `linear-gradient(to right, transparent, black ${fadeLeft}, black calc(100% - ${fadeRight}), transparent)`,
          ].join(', '),
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
          animationName: `${fadeAnimBottom}, ${fadeAnimX}`,
          animationTimingFunction: 'linear, linear',
          animationTimeline: 'scroll(self block), scroll(self inline)',
        },
      },
    },
  },
});

globalStyle(`${scrollFadeBottomX}::-webkit-scrollbar`, webkitHideScrollbar);
