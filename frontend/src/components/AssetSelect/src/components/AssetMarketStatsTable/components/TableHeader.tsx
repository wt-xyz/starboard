import type { FC } from 'react';
import * as $ from './TableHeader.css';

export const TableHeader: FC = () => (
  <thead css={$.thead}>
    <tr>
      <th css={[$.th, $.thStar]} />
      <th css={[$.th, $.thMarket]}>Market</th>
      <th css={[$.th, $.thSortable]}>Last Price</th>
      <th css={[$.th, $.thSortable]}>24h %</th>
      <th css={[$.th, $.thSortable]}>24h Vol.</th>
      <th css={[$.th, $.thSortable]}>Open Interest</th>
      <th css={[$.th, $.thSortable]}>Available Liq.</th>
    </tr>
  </thead>
);
