import { useEffect, useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/ViewFriendList.css';
import { supabase } from '../supabaseClient/supabaseClient'
import { useNavigate } from "react-router-dom";


type Friend = {
  request_id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
}

export function ViewFriendList(){
           
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  function addFriend() {
    navigate("/add-friend");
  }

  // delete at a later time - testing with mock data 
  // const [friends, setFriends] = useState<Friend[]>([
  //   { request_id: "1", sender_id: "katelyn", receiver_id: "cody", status: "pending" },
  //   { request_id: "2", sender_id: "katelyn", receiver_id: "john", status: "accepted" },
  //   { request_id: "3", sender_id: "katelyn", receiver_id: "dawn", status: "accepted" },
  //   { request_id: "4", sender_id: "katelyn", receiver_id: "mike", status: "accepted" },
  // ]);
  // const [userId, setUserId] = useState<string>("katelyn");


  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        console.error("No user found or error:", error);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchFriends() {
      const res = await fetch(`http://localhost:5000/friends/${userId}`);
      const data = await res.json();
      setFriends(data);
    }

    fetchFriends();
  }, [userId]);

  const acceptedFriends = friends.filter(friend => 
    friend.status === "accepted" && 
    (friend.sender_id === userId || friend.receiver_id === userId)
  );


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
          {acceptedFriends.map(friend => {
            const friendId = friend.sender_id === userId ? friend.receiver_id : friend.sender_id;
            return (
              <div key={friend.request_id} className="friend-row">
                <span>{friendId}</span>
                <button className="remove-button">Remove Friend</button>
              </div>
            );
          })}
        </div>

      <Footer/>
    </div>
    </div>
  )
}