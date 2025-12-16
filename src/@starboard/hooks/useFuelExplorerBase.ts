import { useURLConfigs } from '@/hooks/useURLConfigs';

const FALLBACK_FUEL_EXPLORER_BASE = 'https://app.fuel.network';

// Adapter hook to fetch the Fuel explorer base URL with a fallback.
export const useFuelExplorerBase = (): string => {
  const { fuelExplorerBase } = useURLConfigs();
  return fuelExplorerBase ?? FALLBACK_FUEL_EXPLORER_BASE;
};
