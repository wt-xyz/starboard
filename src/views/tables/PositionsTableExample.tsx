/**
 * Example of how to integrate GraphQL positions data into PositionsTable
 *
 * This is a simplified example showing how to fetch and display positions
 * from the GraphQL indexer. You can integrate this into the existing
 * PositionsTable.tsx file.
 */
import { usePositions } from '@/hooks/usePositionsData';

import { Output, OutputType } from '@/components/Output';
import { ColumnDef, Table } from '@/components/Table';

export const GraphQLPositionsTableExample = () => {
  // Fetch all latest positions from GraphQL
  const {
    data: positions,
    isLoading,
    error,
  } = usePositions({
    latestOnly: true,
    enabled: true,
  });

  // Define columns for the table
  const columns: ColumnDef<any>[] = [
    {
      key: 'account',
      label: 'Account',
      renderCell: ({ positionKey }) => (
        <span title={positionKey.account}>
          {positionKey.account.slice(0, 6)}...{positionKey.account.slice(-4)}
        </span>
      ),
    },
    {
      key: 'asset',
      label: 'Asset',
      renderCell: ({ positionKey }) => (
        <span title={positionKey.indexAssetId}>{positionKey.indexAssetId.slice(0, 10)}...</span>
      ),
    },
    {
      key: 'side',
      label: 'Side',
      renderCell: ({ positionKey }) => (
        <span className={positionKey.isLong ? 'text-color-positive' : 'text-color-negative'}>
          {positionKey.isLong ? 'Long' : 'Short'}
        </span>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      renderCell: ({ size }) => (
        <Output type={OutputType.Asset} value={BigInt(size) / BigInt(1_000_000)} />
      ),
    },
    {
      key: 'collateral',
      label: 'Collateral',
      renderCell: ({ collateralAmout }) => (
        <Output type={OutputType.Fiat} value={BigInt(collateralAmout) / BigInt(1_000_000)} />
      ),
    },
    {
      key: 'pnl',
      label: 'Realized PnL',
      renderCell: ({ realizedPnl }) => {
        const pnlValue = BigInt(realizedPnl) / BigInt(1_000_000);
        return <Output type={OutputType.Fiat} value={pnlValue} showSign />;
      },
    },
    {
      key: 'change',
      label: 'Last Change',
      renderCell: ({ change }) => (
        <span className={change === 'INCREASE' ? 'text-color-positive' : 'text-color-text-0'}>
          {change}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Updated',
      renderCell: ({ timestamp }) => <span>{new Date(timestamp * 1000).toLocaleString()}</span>,
    },
  ];

  if (isLoading) {
    return <div>Loading positions from GraphQL...</div>;
  }

  if (error) {
    return <div>Error loading positions: {error.message}</div>;
  }

  if (!positions || positions.length === 0) {
    return <div>No positions found. Make sure the indexer is running and seeded with data.</div>;
  }

  return (
    <div>
      <h2>GraphQL Positions ({positions.length})</h2>
      <p className="text-small text-color-text-0">Data from Squid GraphQL indexer</p>

      <Table
        label="GraphQL Positions"
        data={positions}
        columns={columns}
        getRowKey={(row) => row.id}
      />

      {/* Debug info */}
      <details className="mt-4">
        <summary className="cursor-pointer text-color-text-0">
          Show raw data ({positions.length} positions)
        </summary>
        <pre className="max-h-96 rounded mt-2 overflow-auto bg-color-layer-2 p-2 text-small">
          {JSON.stringify(positions, null, 2)}
        </pre>
      </details>
    </div>
  );
};

/**
 * Example of fetching positions for a specific account
 */
export const AccountPositionsExample = ({ account }: { account?: string }) => {
  const { data: positions, isLoading } = usePositions({
    latestOnly: true,
    account,
    enabled: !!account,
  });

  if (!account) {
    return <div>No account selected</div>;
  }

  if (isLoading) {
    return <div>Loading positions for {account}...</div>;
  }

  if (!positions || positions.length === 0) {
    return <div>No positions found for this account</div>;
  }

  return (
    <div>
      <h3>Positions for {account.slice(0, 10)}...</h3>
      <ul>
        {positions.map((pos) => (
          <li key={pos.id}>
            Asset: {pos.positionKey.indexAssetId} - Size:{' '}
            {(BigInt(pos.size) / BigInt(1_000_000)).toString()} -
            {pos.positionKey.isLong ? 'Long' : 'Short'}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * How to integrate into existing PositionsTable.tsx:
 *
 * 1. Import the hook at the top:
 *    import { usePositions } from '@/hooks/usePositionsData';
 *
 * 2. Add inside your component:
 *    const { data: graphqlPositions } = usePositions({
 *      latestOnly: true,
 *      enabled: true, // or use a feature flag
 *    });
 *
 * 3. Transform the data to match SubaccountPosition format:
 *    const transformedPositions = useMemo(() => {
 *      return graphqlPositions?.map((gqlPos) => ({
 *        // Map GraphQL position to SubaccountPosition
 *        // This depends on your exact data structure
 *        id: gqlPos.id,
 *        market: gqlPos.positionKey.indexAssetId,
 *        side: gqlPos.positionKey.isLong ? 'LONG' : 'SHORT',
 *        size: parseFloat(gqlPos.size) / 1_000_000,
 *        // ... other fields
 *      }));
 *    }, [graphqlPositions]);
 *
 * 4. Merge or use alongside existing positions:
 *    const allPositions = [...existingPositions, ...(transformedPositions || [])];
 */
