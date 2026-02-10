import { createContext } from 'react';
import type { PositionEntity } from 'fuel-ts-sdk/trading';

export const PositionTableRowContext = createContext<PositionEntity | null>(null);
