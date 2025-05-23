import React,{useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Body from './Body'
import Footer from './Footer'
import { useStateProvider } from '../utils/StateProvider'
import axios from 'axios'
import { reducerCases } from '../utils/Constants'
import WebPlayback from './WebPlayback'

export default function Spotify() {
  const [{ token }, dispatch] = useStateProvider();
  const bodyRef = useRef();
  const[navBackground, setNavBackground] = useState(false);
  const[headerBackground, setHeaderBackground] = useState(false);
  const bodyScrolled = () => {
    bodyRef.current.scrollTop >= 30 
    ? setNavBackground(true)
    : setNavBackground(false);
    bodyRef.current.scrollTop >= 268
    ? setHeaderBackground(true)
    : setHeaderBackground(false);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const { data } = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });
      
      const userInfo = {
        userId: data.id,
        userName: data.display_name,
        image: data.images?.[0]?.url,
      };
      
      dispatch({ type: reducerCases.SET_USER, userInfo })
    };

    getUserInfo();
  }, [dispatch, token]);
  return (
    <Container>
      <WebPlayback />
      <div className="spotify__body">
        <Sidebar />
        <div className="body" ref={bodyRef} onScroll={bodyScrolled}>
          <Navbar navBackground={navBackground}/>
          <div className="body__contents">
            <Body headerBackground={headerBackground}/>
          </div>
        </div>
      </div>

      <div className="spotify__footer">
        <Footer />
      </div>
    </Container>
  )
}

const Container = styled.div`
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: 85vh 15vh;
  @media(max-width: 800px){
    grid-template-rows: 90vh 10vh;
  }
  .spotify__body{
    display: grid;
    grid-template-columns: 15vw 85vw;
    height: 100%;
    width: 100%;
    background: linear-gradient(transparent, rgba(0,0,0,1));
    background-color: rgb(32,87,100);
    @media(max-width: 800px){
      grid-template-columns: 1fr;
    }
  }
  .body{
    height: 100vh;
    width: 100%;
    overflow: auto;
    &::-webkit-scrollbar{
      /* display: none; */
      width: 0.7rem;
      &-thumb{
        background-color: rgba(255,255,255,0.6);
      }
    }
    @media(max-width: 800px){
      width: 100vw;
    }
  }


  .body__contents {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding-bottom: 1rem;
  }
`