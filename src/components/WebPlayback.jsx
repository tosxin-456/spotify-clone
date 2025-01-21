// import React, { useEffect, useState } from 'react';
// import { useStateProvider } from '../utils/StateProvider';
// import { reducerCases } from '../utils/Constants';

// const RECONNECT_DELAY = 1000; // 1 second
// const MAX_RECONNECT_ATTEMPTS = 3;

// export default function WebPlayback() {
//   const [{ token }, dispatch] = useStateProvider();
//   const [player, setPlayer] = useState(null);
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);

//   const initializePlayer = () => {
//     if (!token) return null;

//     const player = new window.Spotify.Player({
//       name: 'Web Playback SDK Player',
//       getOAuthToken: cb => { cb(token); },
//       volume: 0.5,
//       enableMediaSession: true,
//       // Add additional configuration for better stability
//       initialization_error_retry_delay: 1000,
//       connection_attempt_timeout: 5000
//     });

//     player.addListener('initialization_error', ({ message }) => {
//       console.error('Failed to initialize:', message);
//       handleReconnect();
//     });

//     player.addListener('authentication_error', ({ message }) => {
//       console.error('Failed to authenticate:', message);
//       dispatch({ type: reducerCases.SET_TOKEN, token: null });
//     });

//     player.addListener('playback_error', ({ message }) => {
//       console.error('Failed to perform playback:', message);
//       handleReconnect();
//     });

//     player.addListener('ready', ({ device_id }) => {
//       console.log('Ready with Device ID', device_id);
//       dispatch({ type: reducerCases.SET_DEVICE_ID, deviceId: device_id });
//       setReconnectAttempts(0); // Reset reconnect attempts on successful connection
//       setPlayer(player);
//     });

//     player.addListener('not_ready', ({ device_id }) => {
//       console.log('Device ID has gone offline', device_id);
//       handleReconnect();
//     });

//     return player;
//   };

//   const handleReconnect = async () => {
//     if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
//       console.error('Max reconnection attempts reached');
//       return;
//     }

//     await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
//     setReconnectAttempts(prev => prev + 1);
    
//     if (player) {
//       player.disconnect();
//     }
    
//     const newPlayer = initializePlayer();
//     if (newPlayer) {
//       newPlayer.connect();
//     }
//   };

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.id = 'spotify-player';
//     script.src = 'https://sdk.scdn.co/spotify-player.js';
//     script.async = true;

//     document.body.appendChild(script);

//     window.onSpotifyWebPlaybackSDKReady = () => {
//       const player = initializePlayer();
//       if (player) {
//         player.connect();
//       }
//     };

//     return () => {
//       if (player) {
//         player.disconnect();
//       }
//       const scriptElement = document.getElementById('spotify-player');
//       if (scriptElement) {
//         scriptElement.remove();
//       }
//     };
//   }, [token]);

//   return null;
// }















// WebPlayback.jsx
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