import { useRequiredContext } from '@/lib/useRequiredContext';
import { MinusIcon } from '@radix-ui/react-icons';
import { Tooltip } from '@radix-ui/themes';
import type { FC } from 'react';
import { useBoolean } from 'usehooks-ts';
import { DecreasePositionDialog } from '../../PositionCard/components/DecreasePositionDialog';
import * as $ from '../PositionTableRow.css';
import { PositionTableRowContext } from '../lib/PositionTableRowContext';

export const ActionsCell: FC = () => {
  const position = useRequiredContext(PositionTableRowContext);
  const modalOpenBoolean = useBoolean();

  return (
    <td css={$.cell}>
      <Tooltip content="Decrease or close position">
        <button className={$.iconButton} onClick={modalOpenBoolean.setTrue}>
          <MinusIcon />
        </button>
      </Tooltip>

      {modalOpenBoolean.value && (
        <DecreasePositionDialog
          positionId={position.stableId}
          open={modalOpenBoolean.value}
          onOpenChange={modalOpenBoolean.setValue}
        />
      )}
    </td>
  );
};
