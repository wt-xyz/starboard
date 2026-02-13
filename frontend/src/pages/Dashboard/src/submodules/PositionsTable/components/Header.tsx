import type { FC, ReactNode } from 'react';
import { propifyEl } from '@/lib/propify';
import * as $ from './Header.css';

export interface HeaderProps {
  children: (childrenBag: typeof headerChildrenBag) => ReactNode;
}

export const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <thead>
      <tr css={$.headerRow}>{children(headerChildrenBag)}</tr>
    </thead>
  );
};

const headerChildrenBag = {
  Action: propifyEl('th', { className: $.headerCell, children: 'Action' }),
  Position: propifyEl('th', { className: $.headerCell, children: 'Position' }),
  Size: propifyEl('th', { className: $.headerCell, children: 'Size' }),
  NetValue: propifyEl('th', { className: $.headerCell, children: 'Net Value' }),
  Collateral: propifyEl('th', { className: $.headerCell, children: 'Collateral' }),
  EntryPrice: propifyEl('th', { className: $.headerCell, children: 'Entry Price' }),
  MarkPrice: propifyEl('th', { className: $.headerCell, children: 'Mark Price' }),
  LiqPrice: propifyEl('th', { className: $.headerCell, children: 'Liq. Price' }),
  RealizedPnl: propifyEl('th', { className: $.headerCell, children: 'Realized PnL' }),
  Blank: propifyEl('th', { className: $.headerCell, children: '' }),
  Custom: propifyEl('th', { className: $.headerCell }),
} as const;
