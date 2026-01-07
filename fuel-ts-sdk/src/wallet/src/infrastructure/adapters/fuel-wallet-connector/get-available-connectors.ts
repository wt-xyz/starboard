import type { FuelConnector } from 'fuels';
import type { ConnectorInfo } from '../../../domain';

export const getAvailableConnectors =
  (connectors: FuelConnector[]) => async (): Promise<ConnectorInfo[]> => {
    const infos: ConnectorInfo[] = [];

    for (const connector of connectors) {
      const installed = await connector.ping().catch(() => false);
      const image = connector.metadata.image;
      const icon = typeof image === 'string' ? image : image?.light;

      infos.push({
        id: connector.name,
        name: connector.name,
        installed: !!installed,
        icon,
      });
    }

    return infos;
  };
