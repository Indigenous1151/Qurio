
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/ViewFriendList.css';
import { supabase } from '../supabaseClient/supabaseClient'
import { useNavigate } from "react-router-dom";

export function ViewFriendList(){
           
  const navigate = useNavigate();

  function addFriend() {
    navigate("/add-friend");
  }

    const [friends, setFriends] = useState([
    { id: 1, username: "example friend 1" },
    { id: 2, username: "example friend 2" },
    { id: 3, username: "example friend 3" },
    ]);



  return(
  <div>
    <Navbar/>
      <h1 className = "update-info-title"></h1>
      <div className="relative overflow-hidden">
             
        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}>
            Friend List <br />
          </h1>
          </div>

        <div>   
            <button className = "add-button"
                     onClick={addFriend}> Add a Friend!</button>
        </div>
        <div>
            <br></br>
        </div>


        <div className="friend-list">
            {friends.map((friend) => (
                <div key={friend.id} className="friend-row">
                <span className="friend-name">{friend.username}</span>
                <button className="friend-button" onClick={() => {}}>Remove Friend</button> 
                </div>                
            ))}
        </div>


      <Footer/>
    </div>
    </div>
  )
}