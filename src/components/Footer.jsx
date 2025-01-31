import React from 'react';
import styled from 'styled-components';
import CurrentTrack from './CurrentTrack';
import PlayerControls from './PlayerControls';
import Volume from './Volume';

export default function Footer() {
  return (
    <Container>
      <CurrentTrack />
      <PlayerControls />
      <div className="volume-container">
        <Volume />
      </div>
    </Container>
  );
}

const Container = styled.div`
  background-color: #181818;
  height: 100%;
  width: 100%;
  border-block-start: 1px solid #282828;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  
  @media (max-width: 800px) {
    grid-template-columns: 1fr 1fr;
    padding: 1rem;
    
    .volume-container {
      display: none;
    }

    & > :first-child {
      justify-self: flex-start;
    }

    & > :nth-child(2) {
      justify-self: flex-end;
    }
  }
`;
