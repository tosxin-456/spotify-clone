import React, { useEffect, useState } from 'react';
import { useStateProvider } from '../utils/StateProvider';
import { reducerCases } from '../utils/Constants';
import axios from 'axios';

export default function WebPlayback() {
  const [{ token }, dispatch] = useStateProvider();
  const [player, setPlayer] = useState(null);

  const updatePlaybackState = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Update player state
        dispatch({
          type: reducerCases.SET_PLAYER_STATE,
          playerState: response.data.is_playing,
        });

        // Update currently playing if needed
        if (response.data.item) {
          const currentlyPlaying = {
            id: response.data.item.id,
            name: response.data.item.name,
            artists: response.data.item.artists.map((artist) => artist.name),
            image: response.data.item.album.images[2].url,
          };
          dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
        }
      }
    } catch (error) {
      console.error("Error updating playback state:", error);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        dispatch({ type: reducerCases.SET_DEVICE_ID, deviceId: device_id });
        updatePlaybackState(); // Initial state sync
      });

      player.addListener('player_state_changed', (state) => {
        if (state) {
          console.log('Player State Changed:', state);
          // Update local state based on SDK state
          dispatch({
            type: reducerCases.SET_PLAYER_STATE,
            playerState: !state.paused,
          });

          
          if (state.track_window?.current_track) {
            const currentTrack = state.track_window.current_track;
            const currentlyPlaying = {
              id: currentTrack.id,
              name: currentTrack.name,
              artists: currentTrack.artists.map(artist => artist.name),
              image: currentTrack.album.images[2]?.url,
            };
            dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
          }
        }
      });

      player.connect().then(success => {
        if (success) {
          console.log('WebPlayback SDK connected successfully');
        }
      });

      setPlayer(player);

      // Poll for state changes every 3 seconds
      const pollInterval = setInterval(updatePlaybackState, 3000);

      return () => {
        clearInterval(pollInterval);
        player.disconnect();
      };
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  return null;
}