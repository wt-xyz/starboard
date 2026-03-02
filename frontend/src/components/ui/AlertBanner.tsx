import { type FC, type ReactNode } from 'react';
import * as $ from './AlertBanner.css';

type AlertBannerProps = {
  variant?: 'info' | 'warning' | 'error' | 'success';
  icon?: ReactNode;
  children: ReactNode;
};

export const AlertBanner: FC<AlertBannerProps> = ({ variant = 'info', icon, children }) => {
  return (
    <div className={$.banner({ variant })}>
      {icon && <span className={$.iconWrapper}>{icon}</span>}
      <span className={$.message}>{children}</span>
    </div>
  );
};
