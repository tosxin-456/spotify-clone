import React from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { useStateProvider } from '../utils/StateProvider'

export default function Navbar({navBackground}) {
  const [{ userInfo }] = useStateProvider();
  return (
    <Container navBackground={navBackground}>
      <div className="search__bar">
        <FaSearch className='search-icon'/>
        <input type='text' placeholder='Artists,songs and podcasts'/>
      </div>

      <div className="avatar">
        <button>
          <CgProfile />
          <span>{ userInfo?.userName }</span>
        </button>
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  height: 15vh;
  position: sticky;
  top: 0;
  transition: 0.3s ease-in-out;
  background-color: ${({navBackground})=>
    navBackground ? "rgba(0,0,0,0.7)": "none"};
  .search__bar{
    background-color: white;
    width: 30%;
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 3px solid transparent;
    transition: all 0.3s ease-in-out;
    input{
      border: none;
      height: 2rem;
      width: 100%;
      outline: none;
    }
    .search-icon{
      color: color 0.3s ease-in-out;
    }
  }
  

  .search__bar:focus-within {
    border-color: #007bff;
    .search-icon{
      color: #007bff;
    }
  }

  .avatar{
    background-color: black;
    padding: 0.3rem 1rem 0.3rem 0.4rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    button{
      background: none;
      padding: 0;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      text-decoration: none;
      font-weight: bold;
      gap: 0.5rem;
      svg{
        font-size: 1.3rem;
        border-radius: 1rem;
        background-color: #282828;
        padding: 0.2rem;
        color: #c7c5c5;
      }
    }
  }

`