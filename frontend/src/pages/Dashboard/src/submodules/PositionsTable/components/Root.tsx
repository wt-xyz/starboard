import { type FC, type ReactNode } from 'react';
import * as $ from './Root.css';

type RootProps = {
  header: ReactNode;
  body: ReactNode;
};

export const Root: FC<RootProps> = ({ body, header }) => {
  return (
    <table css={$.table}>
      {header}
      <tbody>{body}</tbody>
    </table>
  );
};
