import React from 'react'
import styled from 'styled-components';

export default function Login() {
  const handleClick = () => {
    const clientId = '236f4498c66d4cfe8eb0944ca5d3d5b4';
    const redirectUrl = "https://3000-idx-spotify-clone-1736886740698.cluster-blu4edcrfnajktuztkjzgyxzek.cloudworkstations.dev/";
    const apiUrl = "https://accounts.spotify.com/authorize"
    const scope = [
        'user-read-email', 
        'user-read-private',
        'user-modify-playback-state', 
        'user-read-playback-state', 
        'user-read-currently-playing',
        'user-read-playback-position',
        'user-top-read',
        'user-read-recently-played',
    ]
    window.location.href = `${apiUrl}?client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${scope.join(
        " "
    )}&response_type=token&show_dialog=true`
  }
  return (
    <Container>
        <img src='https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Full_Logo_RGB_Black.png' alt='Spotify logo' />
        <button onClick={handleClick}>Connect Spotify</button>
    </Container>
  )
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: #1db954;
    gap: 5rem;
    img{
        height: 20vh
    }
    button{
        padding: 1rem 5rem;
        border-radius: 5rem;
        border: none;
        background-color: black;
        color: #49f585;
        font-size: 1.4rem;
        cursor: pointer;
    }
`;
