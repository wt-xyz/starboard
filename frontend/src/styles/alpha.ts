export const alpha = (colorVar: string, percent: number) =>
  `color-mix(in oklch, ${colorVar} ${percent}%, transparent)`;
