import type { DepositCollateralDependencies } from './depositCollateral';
import { createDepositCollateralCommand } from './depositCollateral';
import type { WithdrawCollateralDependencies } from './withdrawCollateral';
import { createWithdrawCollateralCommand } from './withdrawCollateral';

export type TradingCommandsDependencies = DepositCollateralDependencies &
  WithdrawCollateralDependencies;

export const createTradingCommands = (deps: TradingCommandsDependencies) => ({
  depositCollateral: createDepositCollateralCommand(deps),
  withdrawCollateral: createWithdrawCollateralCommand(deps),
});

export type TradingCommands = ReturnType<typeof createTradingCommands>;
