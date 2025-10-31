import { useState } from 'react';
import { BaseLightweightChart } from './BaseLightweightChart';

export const LightweightChartLaunchable = ({ marketId }: { marketId: string }) => {
  const [isSimpleUi] = useState(false);

  return <BaseLightweightChart symbol={marketId} isLaunchable isSimpleUi={isSimpleUi} />;
};

