import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const Panel = styled.div`
  flex: ${props => props.flex};
  border: 1px solid #ccc;
`;

const SplitScreen = ({ children, leftWidth, rightWidth }) => {
  const [left, right] = children;

  return (
    <Container>
      <Panel flex={leftWidth}>
        {left}
      </Panel>
      <Panel flex={rightWidth}>
        {right}
      </Panel>
    </Container>
  );
};

export default SplitScreen;