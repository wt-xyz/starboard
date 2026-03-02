import { ORDER_SIDES, type OrderSide } from '@/modules/PositionForm';

export interface IncreasePositionFormModel {
  orderSide: OrderSide;
  collateralSize: string;
  positionSize: string;
  leverage: string;
}

export const nullIncreasePositionForm: IncreasePositionFormModel = {
  orderSide: 'long',
  positionSize: '',
  collateralSize: '',
  leverage: '10',
};

export { ORDER_SIDES, type OrderSide };
