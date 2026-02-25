import { Outlet } from 'react-router';
import { componentize } from '@/lib/componentize';
import * as $ from './DashboardLayout.css';
import { DashboardHeader } from './components/DashboardHeader';

export function DashboardLayout() {
  return (
    <$$.page>
      <DashboardHeader />

      <main css={$.container}>
        <Outlet />
      </main>
    </$$.page>
  );
}

const $$ = componentize($);
