// Namespaced exports for module access
export * as DecreasePositionForm from './src/submodules/DecreasePositionForm';
export * as EditCollateralForm from './src/submodules/EditCollateralForm';
export * as IncreasePositionForm from './src/submodules/IncreasePositionForm';
export * as PositionsTable from './src/submodules/PositionsTable';
export * as PositionStats from './src/submodules/PositionStats';

// Type exports - use fully qualified names to avoid conflicts
export type { DecreasePositionFormModel } from './src/submodules/DecreasePositionForm';
export type { EditCollateralFormModel } from './src/submodules/EditCollateralForm';
export type { IncreasePositionFormModel, OrderSide } from './src/submodules/IncreasePositionForm';
export type * from './src/submodules/PositionsTable';

// Direct exports for schemas and model constants
export { DecreasePositionFormSchema } from './src/submodules/DecreasePositionForm';
export {
  COLLATERAL_ACTIONS,
  EditCollateralFormSchema,
  nullEditCollateralForm,
} from './src/submodules/EditCollateralForm';
export {
  createIncreasePositionFormSchema,
  nullIncreasePositionForm,
  ORDER_SIDES,
} from './src/submodules/IncreasePositionForm';
