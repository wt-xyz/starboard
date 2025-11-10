import styled, { css } from 'styled-components';

import { Button } from '@/components/Button';

export default {
  RootStyle: styled.div`
    padding: 1.5px;
  `,

  TypeButton: styled(Button)<{ $active: boolean }>`
    padding: 0.5rem 1.25rem;
    font: var(--font-medium-medium);

    ${({ $active }) =>
      $active
        ? css`
            background-color: var(--color-layer-1);
            color: var(--color-text-2);
          `
        : css`
            color: var(--color-text-0);
          `};
  `,
};
