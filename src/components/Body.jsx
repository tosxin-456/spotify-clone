import React, { useEffect } from 'react';
import styled from 'styled-components';
import { AiFillClockCircle } from 'react-icons/ai';
import {useStateProvider} from '../utils/StateProvider';
import axios from 'axios';
import { reducerCases } from '../utils/Constants'

export default function Body({headerBackground}) {

  const truncateText =(text, maxLength = 20) => {
    if(text.length > maxLength){
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };


  const [{ token, selectedPlaylistId, selectedPlaylist }, dispatch] = useStateProvider();
  useEffect(()=> {
    const getInitialPlaylist = async () => {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}` , 
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
          }
      );
      const selectedPlaylist = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description.startsWith("<a") 
          ? "" 
          : response.data.description,
        image: response.data.images[0].url,
        tracks: response.data.tracks.items.map(({track})=> ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist)=> artist.name),
          image: track.album.images[2].url,
          duration: track.duration_ms,
          album: track.album.name,
          context_uri: track.album.uri,
          track_number: track.track_number,
        })),
      };
      dispatch({type: reducerCases.SET_PLAYLIST, selectedPlaylist})
    };
    getInitialPlaylist();
  },[token, dispatch, selectedPlaylistId]);

  const msToMinutesAndSeconds = (ms) => {
    const minutes = Math.floor(ms/60000);
    const seconds = ((ms%60000)/1000).toFixed(0);
    return minutes + ":" + (seconds <10 ? "0" : "") + seconds;
  }

  const playTrack = async(
    id,
    name,
    artists,
    image,
    context_uri,
    track_number,
  ) => {
    const response = await axios.put(
      `https://api.spotify.com/v1/me/player/play`,
      {
        context_uri,
        offset: {
          position: track_number -1,
        },
        position_ms: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    if(response.status===204){
      const currentlyPlaying = {
        id,
        name,
        artists,
        image,
      };
      dispatch({type:reducerCases.SET_PLAYING, currentlyPlaying});
      dispatch({type:reducerCases.SET_PLAYER_STATE, playerState: true});
    } else dispatch({type:reducerCases.SET_PLAYER_STATE, playerState: true});
  }

  return (
    <Container headerBackground={headerBackground}>
      {selectedPlaylist && (
          <>
            <div className="playlist">
              <div className="image">
                <img src={selectedPlaylist.image} alt='Selected Playlist'/>
              </div>
              <div className="details">
                <span className='type'>PLAYLIST</span>
                <h1 className='title'>{selectedPlaylist.name}</h1>
                <p className="description">
                  {selectedPlaylist.description}
                </p>
              </div>
            </div>

            <div className="list">
              <div className="header__row">
                <div className="col">
                  <span>#</span>
                </div>
                <div className="col">
                  <span>TITLE</span>
                </div>
                <div className="col">
                  <span>ALBUM</span>
                </div>
                <div className="col">
                  <span>
                    <AiFillClockCircle />
                  </span>
                </div>
              </div>

              <div className="tracks">
                {selectedPlaylist.tracks.map(({
                    id,
                    name,
                    artists,
                    image,
                    duration,
                    album,
                    context_uri,
                    track_number,
                  }, index)=> {
                    return (
                      <div className="row" key={id} onClick={()=>playTrack(id,name,artists,image,context_uri,track_number)}>
                        <div className="col">
                          <span>{index+1}</span>
                        </div>

                        <div className="col detail">
                          <div className="image">
                            <img src={image} alt="track"/>
                          </div>
                          <div className="info">
                            <span className="name" title={name}>{truncateText(name)}</span>
                            <span className="artists" title={artists.join(", ")}>{truncateText(artists.join(", "))}</span>
                          </div>
                        </div>

                        <div className="col">
                          <span className="album" title={album}>{truncateText(album)}</span>
                        </div>

                        <div className="col">
                          <span>{msToMinutesAndSeconds(duration)}</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        )
      }
    </Container>

  )
};

const Container = styled.div`
  .playlist{
    margin: 0 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    .image{
      img{
        height: 12rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
      }
    }
    .details{
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 0;
      color: #e0dede;
      .title{
        color: white;
        font-size: 4rem;
        margin: 0;
        max-width: 100% //new line
      }
      .description{
        font-size: 16px;
        /* @media(max-width: 800px){
          text-wrap: wrap;
        } */
      }
    }
  }
  .list{
    .header__row{
      display: grid;
      grid-template-columns: 0.3fr 3fr 2fr 0.1fr;
      color: #dddcdc;
      margin: 1rem 0 0 0;
      position: sticky;
      top: 15vh;
      padding: 1rem 3rem;
      transition: 0.3s ease-in-out;
      background-color: ${({headerBackground})=>
        headerBackground ? "#000000dc": "none"};
      
      @media (max-width: 800px){
        grid-template-columns: 0.1fr 1fr 0.7fr 0.1fr;
      }
    }
    .tracks{
      margin: 0 2rem;
      display: flex;
      flex-direction: column;
      margin-block-end: 5rem;
      /* cursor: pointer; */
      .row{
        padding: 0.5rem 1rem;
        display: grid;
        grid-template-columns: 0.3fr 3.1fr 1.8fr 0.1fr;
        
        @media(max-width: 800px){
          grid-template-columns: 0.1fr 1fr 0.7fr 0.1fr;
          padding: 0.5rem;
        }
        &:hover{
          background-color: rgb(0,0,0,0.7);
        }
        .col{
          display: flex;
          align-items: center;
          color: #dddcdc;
          min-width: 0;
          img{
            height: 40px;
            border-radius: 0.3rem;
          }
        }
        .detail{
          display: flex;
          gap: 1rem;
          min-width: 0;
          .info{
            display: flex;
            flex-direction: column;
            max-width: calc(100%-60px); //new lines
            min-width: 0;
            .name, .artists{
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
            }
          }
        } 
        .album{
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
    
        }
        @media(max-width: 800px){
          .album{
            display: none;
          }
          .header__row{
            grid-template-columns: 0.1fr 1fr 0.1fr;
          }
          .row{
            grid-template-columns: 0.1fr 1fr 0.1fr;
          }
        }
      }
    }
  }
`