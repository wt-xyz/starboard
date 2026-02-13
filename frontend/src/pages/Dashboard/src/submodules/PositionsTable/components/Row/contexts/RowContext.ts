import { createContext } from 'react';
import type { PositionEntity } from 'fuel-ts-sdk/trading';

export const RowContext = createContext<PositionEntity | null>(null);
