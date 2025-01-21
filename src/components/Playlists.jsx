import React, {useEffect} from 'react'
import { useStateProvider } from '../utils/StateProvider'
import { reducerCases } from '../utils/Constants'
import axios from 'axios'
import styled from 'styled-components'

export default function Playlists() {
    const[{ token, playlists }, dispatch] = useStateProvider();
    useEffect(()=> {
      const getPlaylistData = async () => {
        const response = await axios.get(
          'https://api.spotify.com/v1/me/playlists',
          {
            headers: {
              Authorization: "Bearer "+token, 
              "Content-Type": "application/json",
            },
          }
        );
        const { items } = response.data;
        const playlists = items.map(({name, id})=>{
          return {name, id};
        });
        dispatch({type:reducerCases.SET_PLAYLISTS, playlists})
      };
      
      getPlaylistData();
    }, [token,dispatch])

    const changeCurrentPlaylist = (selectedPlaylistId) => {
      dispatch({type:reducerCases.SET_PLAYLIST_ID, selectedPlaylistId})
    }
  return (
    <Container>
      <ul>
        {
          playlists.map(({name, id})=> {
            return (
              <li key={id} onClick={()=>changeCurrentPlaylist(id)}>
                {name}
              </li>
            )
          })
        }
      </ul>
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  overflow: hidden;
  ul{
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    height: 55vh;
    max-height: 100%;
    overflow: auto;
    &::-webkit-scrollbar{
      /* display: none; */
      width: 0.7rem;
      &-thumb{
        background-color: rgba(255,255,255,0.6);
      }
    }
    li {
      display: flex;
      gap: 1rem;
      cursor: pointer;
      transition: 0.3s ease-in-out;
      &:hover{
        color: white;
      }
      align-items: center;
    }
  }
`;











// import React, {useEffect} from 'react'
// import { useStateProvider } from '../utils/StateProvider'
// import { reducerCases } from '../utils/Constants'
// import axios from 'axios'
// import styled from 'styled-components'

// export default function Playlists() {
//     const[{ token, playlists }, dispatch] = useStateProvider();

//     useEffect(()=> {
//       const getPlaylistData = async () => {
//         let allPlaylists = [];
//         let url = 'https://api.spotify.com/v1/me/playlists?limit=50';
        
//         while (url) {
//           try {
//             const response = await axios.get(url, {
//               headers: {
//                 Authorization: "Bearer " + token,
//                 "Content-Type": "application/json",
//               },
//             });
            
//             const { items, next } = response.data;
//             allPlaylists = [...allPlaylists, ...items.map(({ name, id }) => ({ name, id }))];
//             url = next; 
//           } catch (error) {
//               console.error("Error fetching playlists:", error);
             
//               url = null;
//           }
//         }
        
//         dispatch({ type: reducerCases.SET_PLAYLISTS, playlists: allPlaylists });
//       };
//       if(token) { // Only try to fetch playlist data when token is not null or empty
//         getPlaylistData();
//       }
//     }, [token]) // remove dispatch from the dependency array

//     const changeCurrentPlaylist = (selectedPlaylistId) => {
//       dispatch({type:reducerCases.SET_PLAYLIST_ID, selectedPlaylistId})
//     }
//   return (
//     <Container>
//       <ul>
//         {
//           playlists.map(({name, id})=> {
//             return (
//               <li key={id} onClick={()=>changeCurrentPlaylist(id)}>
//                 {name}
//               </li>
//             )
//           })
//         }
//       </ul>
//     </Container>
//   )
// }

// const Container = styled.div`
//   height: 100%;
//   overflow: hidden;
//   ul{
//     list-style-type: none;
//     display: flex;
//     flex-direction: column;
//     gap: 1rem;
//     padding: 1rem;
//     height: 55vh;
//     max-height: 100%;
//     overflow: auto;
//     &::-webkit-scrollbar{
//       /* display: none; */
//       width: 0.7rem;
//       &-thumb{
//         background-color: rgba(255,255,255,0.6);
//       }
//     }
//     li {
//       display: flex;
//       gap: 1rem;
//       cursor: pointer;
//       transition: 0.3s ease-in-out;
//       &:hover{
//         color: white;
//       }
//       align-items: center;
//     }
//   }
// `;