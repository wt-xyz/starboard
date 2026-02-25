export const ASSET_ICONS: Record<string, string> = {
  BTCUSD: 'https://verified-assets.fuel.network/images/solvBTC.webp',
  ETHUSD: 'https://verified-assets.fuel.network/images/eth.svg',
  FUELUSD: 'https://verified-assets.fuel.network/images/fuel.svg',
};

export function formatSymbol(symbol: string): string {
  return symbol.replace(/USD$/, '/USD');
}
