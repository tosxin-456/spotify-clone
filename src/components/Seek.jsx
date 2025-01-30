import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStateProvider } from '../utils/StateProvider';
import axios from 'axios';

const Seek = () => {
  const [{ token }] = useStateProvider();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            'https://api.spotify.com/v1/me/player',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.data) {
            setPosition(response.data.progress_ms);
            setDuration(response.data.item.duration_ms);
          }
        } catch (error) {
          console.error('Error fetching playback state:', error);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [token, isDragging]);

  const handleSeek = async (newPosition) => {
    try {
      await axios.put(
        'https://api.spotify.com/v1/me/player/seek',
        null,
        {
          params: { position_ms: newPosition },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setPosition(newPosition);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  return (
    <SeekBarContainer>
      <TimeStamp>{formatTime(position)}</TimeStamp>
      <SeekBarWrapper>
        <SeekInput
          type="range"
          min="0"
          max={duration || 100}
          value={position}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => {
            setIsDragging(false);
            handleSeek(position);
          }}
          onChange={(e) => setPosition(parseInt(e.target.value))}
        />
      </SeekBarWrapper>
      <TimeStamp>{formatTime(duration)}</TimeStamp>
    </SeekBarContainer>
  );
};

const SeekBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0 1rem;
  @media(max-width: 800px) {
    display: none;
  }
`;

const TimeStamp = styled.span`
  color: #b3b3b3;
  font-size: 0.75rem;
  min-width: 40px;
`;

const SeekBarWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const SeekInput = styled.input`
  width: 100%;
  height: 4px;
  appearance: none;
  background: #4f4f4f;
  border-radius: 2px;
  cursor: pointer;
  position: relative;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3A6EA5;
    cursor: pointer;
    border: none;
    opacity: 0;
    transition: opacity 0.2s;
    margin-top: -4px;
  }

  &:hover::-webkit-slider-thumb {
    opacity: 1;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(
      to right,
      #1db954 0%,
      #1db954 ${props => (props.value / props.max) * 100}%,
      #4f4f4f ${props => (props.value / props.max) * 100}%,
      #4f4f4f 100%
    );
    border-radius: 2px;
    border: none;
  }
`;

export default Seek;