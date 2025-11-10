import styled from 'styled-components';

export default {
  RootStyle: styled.div`
    padding: 1.5px;
  `,

  FormBox: styled.div<{ active: boolean }>`
    display: ${(props) => (props.active ? 'block' : 'none')};
  `,
};
