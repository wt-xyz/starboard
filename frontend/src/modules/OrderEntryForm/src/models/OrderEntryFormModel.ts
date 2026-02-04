import { ORDER_SIDES, type OrderSide } from '@/modules/PositionForm';

export { ORDER_SIDES, type OrderSide };

export interface OrderEntryFormModel {
  orderSide: OrderSide;
  collateralSize: string;
  positionSize: string;
  leverage: string;
}

export const nullOrderEntryForm: OrderEntryFormModel = {
  orderSide: 'long',
  positionSize: '',
  collateralSize: '',
  leverage: '10',
};
