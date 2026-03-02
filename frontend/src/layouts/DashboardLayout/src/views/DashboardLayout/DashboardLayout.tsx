import { Outlet } from 'react-router';
import { componentize } from '@/lib/componentize';
import * as $ from './DashboardLayout.css';
import { DashboardFooter } from './components/DashboardFooter';
import { DashboardHeader } from './components/DashboardHeader';

export function DashboardLayout() {
  return (
    <$$.page>
      <DashboardHeader />

      <main css={$.container}>
        <Outlet />
      </main>

      <DashboardFooter />
    </$$.page>
  );
}

const $$ = componentize($);
