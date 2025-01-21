import React, { useEffect, useState } from 'react';
import { useStateProvider } from '../utils/StateProvider';
import { reducerCases } from '../utils/Constants';
import axios from 'axios';

export default function WebPlayback() {
  const [{ token }, dispatch] = useStateProvider();
  const [player, setPlayer] = useState(null);

  const updateTrackInfo = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const currentlyPlaying = {
          id: response.data.item.id,
          name: response.data.item.name,
          artists: response.data.item.artists.map((artist) => artist.name),
          image: response.data.item.album.images[2].url,
        };
        dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
        dispatch({ 
          type: reducerCases.SET_PLAYER_STATE, 
          playerState: !response.data.is_paused 
        });
      }
    } catch (error) {
      console.error("Error fetching current track:", error);
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
      });

      player.addListener('player_state_changed', (state) => {
        if (state) {
          // Update track info when state changes
          updateTrackInfo();
        }
      });

      player.connect();
      setPlayer(player);

      // Set up polling for external changes
      const pollInterval = setInterval(updateTrackInfo, 1000);

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