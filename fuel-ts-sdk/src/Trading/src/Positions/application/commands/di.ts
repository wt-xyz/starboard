import type { DecreasePositionDependencies } from './decreasePosition';
import { createDecreasePositionCommand } from './decreasePosition';
import type { SubmitOrderDependencies } from './submitOrder';
import { createSubmitOrder } from './submitOrder';
import type { SyncPositionsByAccountDependencies } from './syncPositionsByAccount';
import { createSyncPositionsByAccountCommands } from './syncPositionsByAccount';

export type PositionCommandsDependencies = SubmitOrderDependencies &
  DecreasePositionDependencies &
  SyncPositionsByAccountDependencies;

export const createPositionCommands = (deps: PositionCommandsDependencies) => ({
  submitOrder: createSubmitOrder(deps),
  decreasePosition: createDecreasePositionCommand(deps),
  ...createSyncPositionsByAccountCommands(deps),
});

export type PositionCommands = ReturnType<typeof createPositionCommands>;
