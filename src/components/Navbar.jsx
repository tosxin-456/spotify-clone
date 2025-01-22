import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { useStateProvider } from '../utils/StateProvider';
import axios from 'axios';

export default function Navbar({ navBackground }) {
  const [{ userInfo, token }] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchTracks();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  const searchTracks = async () => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSearchResults(response.data.tracks.items);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };

  const playTrack = async (trackUri) => {
    try {
      await axios.put(
        'https://api.spotify.com/v1/me/player/play',
        {
          uris: [trackUri],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setShowDropdown(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  return (
    <Container navBackground={navBackground}>
      <div className="search__bar" ref={searchRef}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Artists, songs and podcasts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="search__results">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className="track__item"
                onClick={() => playTrack(track.uri)}
              >
                <img
                  src={track.album.images[2]?.url}
                  alt={track.name}
                  className="track__image"
                />
                <div className="track__info">
                  <div className="track__name">{track.name}</div>
                  <div className="track__artist">
                    {track.artists.map((artist) => artist.name).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="avatar">
        <button>
          {userInfo?.image ? (
            <img src={userInfo.image} alt="Profile" />
          ) : (
            <CgProfile />
          )}
          <span>{userInfo?.userName}</span>
        </button>
      </div>
    </Container>
  );
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
  background-color: ${({ navBackground }) =>
    navBackground ? "rgba(0,0,0,0.7)" : "none"};
  z-index: 1000;

  .search__bar {
    background-color: white;
    width: 30%;
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 3px solid transparent;
    transition: all 0.3s ease-in-out;
    position: relative;

    input {
      border: none;
      height: 2rem;
      font-size: 20px;
      width: 100%;
      outline: none;
    }

    .search-icon {
      color: color 0.3s ease-in-out;
    }

    .search__results {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background-color: #000000;
      border-radius: 0.5rem;
      max-height: 15rem;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #666;
        border-radius: 4px;
      }

      .track__item {
        display: flex;
        align-items: center;
        padding: 0.7rem 1rem;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #333333;
        }

        .track__image {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          margin-right: 1rem;
        }

        .track__info {
          flex: 1;
          min-width: 0;

          .track__name {
            color: white;
            font-size: 0.9rem;
            margin-bottom: 0.2rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .track__artist {
            color: #666666;
            font-size: 0.8rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .search__bar:focus-within {
    border-color: #ACC3A6;
    .search-icon {
      color: #ACC3A6;
    }
  }

  .avatar {
    background-color: black;
    padding: 0.3rem 1rem 0.3rem 0.4rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    button {
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
      img {
        width: 1.3rem;
        height: 1.3rem;
        border-radius: 1rem;
        object-fit: cover;
      }
      svg {
        font-size: 1.3rem;
        border-radius: 1rem;
        background-color: #282828;
        padding: 0.2rem;
        color: #c7c5c5;
      }
    }
  }
`;