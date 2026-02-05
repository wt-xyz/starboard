// Namespaced exports for module access
export * as DecreasePositionForm from './src/submodules/DecreasePositionForm';
export * as IncreasePositionForm from './src/submodules/IncreasePositionForm';
export * as EditCollateralForm from './src/submodules/EditCollateralForm';
export * as PositionStats from './src/submodules/PositionStats';

// Type exports - use fully qualified names to avoid conflicts
export type { DecreasePositionFormModel } from './src/submodules/DecreasePositionForm';
export type { IncreasePositionFormModel, OrderSide } from './src/submodules/IncreasePositionForm';
export type { EditCollateralFormModel } from './src/submodules/EditCollateralForm';

// Direct exports for schemas and model constants
export { DecreasePositionFormSchema } from './src/submodules/DecreasePositionForm';
export {
  createIncreasePositionFormSchema,
  nullIncreasePositionForm,
  ORDER_SIDES,
} from './src/submodules/IncreasePositionForm';
export {
  EditCollateralFormSchema,
  nullEditCollateralForm,
  COLLATERAL_ACTIONS,
} from './src/submodules/EditCollateralForm';
