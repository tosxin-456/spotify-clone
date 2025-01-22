import React from "react";
import styled from "styled-components";
import {
  BsFillPlayCircleFill,
  BsFillPauseCircleFill,
  BsShuffle,
} from "react-icons/bs";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";
import { FiRepeat } from "react-icons/fi";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";
import { reducerCases } from "../utils/Constants";
import {MdDevices} from "react-icons/md";
import Seek from './Seek'


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const retryWithDelay = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.response?.status === 429) {
      await delay(delayMs);
      return retryWithDelay(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

export default function PlayerControls() {
  const [{ token, playerState, deviceId }, dispatch] = useStateProvider();

  const changeState = async () => {
    try {
      const state = playerState ? "pause" : "play";
      await axios.put(
        `https://api.spotify.com/v1/me/player/${state}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      // Update local state immediately
      dispatch({
        type: reducerCases.SET_PLAYER_STATE,
        playerState: !playerState,
      });

      // Verify the state change
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      // Ensure UI reflects actual playback state
      if (response.data) {
        dispatch({
          type: reducerCases.SET_PLAYER_STATE,
          playerState: response.data.is_playing,
        });
      }
    } catch (error) {
      console.error("Error changing playback state:", error);
      // Revert to previous state if there's an error
      dispatch({
        type: reducerCases.SET_PLAYER_STATE,
        playerState: playerState,
      });
    }
  };


  
  const changeTrack = async (type) => {
    await axios.post(
      `https://api.spotify.com/v1/me/player/${type}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    const response1 = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (response1.data !== "") {
      const currentlyPlaying = {
        id: response1.data.item.id,
        name: response1.data.item.name,
        artists: response1.data.item.artists.map((artist) => artist.name),
        image: response1.data.item.album.images[2].url,
      };
      dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
    } else {
      dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying: null });
    }
  };

  const transferPlayback = async () => {
    if (!deviceId) {
      console.error('No device ID available');
      return;
    }
  
    try {
      
      const currentPlayback = await retryWithDelay(() =>
        axios.get('https://api.spotify.com/v1/me/player', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      );

      // NEW: Wait briefly before transfer
      await delay(500);
  
      
      await retryWithDelay(() =>
        axios.put(
          'https://api.spotify.com/v1/me/player',
          {
            device_ids: [deviceId],
            play: currentPlayback.data?.is_playing ?? true,
            position_ms: currentPlayback.data?.progress_ms ?? 0
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      // NEW: Wait for transfer to complete
      await delay(1000);

      // NEW: Verify transfer was successful
      const verifyTransfer = await retryWithDelay(() =>
        axios.get('https://api.spotify.com/v1/me/player', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );

      if (verifyTransfer.data?.device?.id !== deviceId) {
        throw new Error('Transfer verification failed');
      }

    } catch (error) {
      console.error("Error transferring playback:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  };

  return (
    <Container>
      <ControlsWrapper>
        <div className="shuffle">
          <BsShuffle />
        </div>
        <div className="previous">
          <CgPlayTrackPrev onClick={() => changeTrack("previous")} />
        </div>
        <div className="state">
          {playerState ? (
            <BsFillPauseCircleFill onClick={changeState} />
          ) : (
            <BsFillPlayCircleFill onClick={changeState} />
          )}
        </div>
        <div className="next">
          <CgPlayTrackNext onClick={() => changeTrack("next")} />
        </div>
        <div className="repeat">
          <FiRepeat />
        </div>
        <div className="devices">
          <MdDevices onClick={transferPlayback} />
        </div>
      </ControlsWrapper>
      <SeekWrapper>
        <Seek />
      </SeekWrapper>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

const ControlsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;

svg {
  color: #b3b3b3;
  transition: 0.2s ease-in-out;
  cursor: pointer;
  &:hover {
    color: white;
    transform: scale(1.3);
  }
}

.state {
  svg {
    color: white;
  }
}

.previous, .next, .state {
  font-size: 2rem;
}
`;

const SeekWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 0 1rem;
`;