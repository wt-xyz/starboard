import { Outlet } from 'react-router';
import { WalletConnector } from '@/components/Wallet';
import { NetworkSwitchContext } from '@/contexts/network-switch/network-switch.context';
import { useRequiredContext } from '@/lib/use-required-context.hook';
import { NETWORKS, type Network } from '@/models/network';
import { dashboardButton } from '../../styles/dashboard-button.css';
import { AssetSelect } from './components/asset-select.component';
import * as styles from './dashboard-layout.css';

export function DashboardLayout() {
  const networkSwitch = useRequiredContext(NetworkSwitchContext);
  const currentNetwork = networkSwitch.getCurrentNetwork();

  function switchTo(network: Network) {
    networkSwitch.changeNetwork(network);
  }

  return (
    <div css={styles.page}>
      <header css={styles.header}>
        <div>
          <div css={styles.logo}>Starboard</div>
        </div>

        <AssetSelect />

        <div css={styles.headerRight}>
          <div css={styles.networkSection}>
            <span css={styles.networkLabel}>Network</span>
            <div css={styles.networkSelector}>
              {NETWORKS.map((network) => (
                <button
                  onClick={() => switchTo(network)}
                  key={network}
                  css={currentNetwork === network ? styles.buttonActive : dashboardButton}
                >
                  {NETWORK_DISPLAY_VALUES[network]}
                </button>
              ))}
            </div>
          </div>

          <WalletConnector />
        </div>
      </header>

      <main css={styles.container}>
        <Outlet />
      </main>
    </div>
  );
}

const NETWORK_DISPLAY_VALUES: Record<Network, string> = {
  local: 'Local Node',
  testnet: 'Testnet',
};
