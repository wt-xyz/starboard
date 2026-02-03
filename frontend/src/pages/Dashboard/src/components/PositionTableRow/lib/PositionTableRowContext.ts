import type { PositionEntity } from 'fuel-ts-sdk/trading';
import { createContext } from 'react';

export const PositionTableRowContext = createContext<PositionEntity | null>(null);
