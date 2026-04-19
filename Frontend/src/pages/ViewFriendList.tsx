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
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
  };


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

  // Getting the current user ID that is logged in to Qurio
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        console.error("No user found:", error);
      }
    }

    fetchUser();
  }, []);
useEffect(() => {
  if (!userId) return;

  async function fetchAllFriends() {
    try {
      const headers = await getAuthHeader();

      const [friendsRes, pendingRes] = await Promise.all([
        fetch("http://localhost:5001/friend/list", {
          method: "GET",
          headers
        }),
        fetch("http://localhost:5001/friend/pending", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId as string
          }
        })
      ]);

      const friendsData = await friendsRes.json();
      const pendingData = await pendingRes.json();

      const allFriends = [
        ...(friendsData.friends || []),
        ...(pendingData.pending_requests || [])
      ];

      setFriends(allFriends);

    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  }

  fetchAllFriends();
}, [userId]);

 useEffect(() => {
  if (!userId) return;

  async function fetchPendingFriends() {
    try {
      const res = await fetch("http://localhost:5001/friend/pending", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId as string
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch pending friends: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched pending friends:", data);

      // Ensure it's always an array
      const pendingArray = Array.isArray(data.pending_requests)
        ? data.pending_requests
        : [];

      // Merge with existing friends without duplicates
      setFriends(prev => {
        const newFriends = pendingArray.filter(
          (p: Friend) => !prev.some(f => f.request_id === p.request_id)
        );
        return [...prev, ...newFriends];
      });

    } catch (err) {
      console.error("Error fetching pending friends:", err);
    }
  }

  fetchPendingFriends();
}, [userId]);

  // getting usernames from table
  useEffect(() => {
    if (!userId || friends.length === 0) return;

    async function fetchUsernames(friendIds: string[]) {
      const { data, error } = await supabase
        .from("public_profile") 
        .select("user_id, username")
        .in("user_id", friendIds);

      if (error) {
        console.error("Error fetching usernames:", error);
        return;
      }

      const map: { [key: string]: string } = {};
      data.forEach(user => {
        map[user.user_id] = user.username;
      });

      setUsernames(map);
    }

    const friendIds = friends.map(friend =>
      friend.sender_id === userId
        ? friend.receiver_id
        : friend.sender_id
    );

    fetchUsernames(friendIds);

  }, [friends, userId]);

  // Filter accepted friends
  const acceptedFriends = friends.filter(
    f => f.status === "accepted"
  );

  // Filter pending friends 
const pendingFriends = friends.filter(friend => {
  console.log("Friend Status:", friend.status); // Logs the status of each friend
  return friend.status === "pending" && friend.receiver_id === userId;
});
  console.log("Pending friends:", pendingFriends);

// Logic for removing friends from the friend list
async function removeFriend(friendId: string, requestId: string) {
  try {
    if (!userId) return;

    const headers = await getAuthHeader();
    const res = await fetch("http://localhost:5001/friend/remove", {
      method: "DELETE",
      headers: {
        ...headers
      },
      body: JSON.stringify({
        friend_id: friendId
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to remove friend: ${res.status}`);
    }

    setFriends(prev =>
      prev.filter(friend => friend.request_id !== requestId)
    );

  } catch (err) {
    console.error("Error removing friend:", err);
  }
}

// logic for accepting friend requests s
async function acceptFriend(senderId: string, requestId: string) {
  try {
    if (!userId) return;

    const res = await fetch("http://localhost:5001/friend/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId
      },
      body: JSON.stringify({
        sender_id: senderId
      })
    });

    if (!res.ok) {
      throw new Error("Failed to accept request");
    }

    // update UI
    setFriends(prev =>
      prev.map(f =>
        f.request_id === requestId ? { ...f, status: "accepted" } : f
      )
    );

  } catch (err) {
    console.error("Error accepting friend:", err);
  }
}

// logic for declining friend requests
async function declineFriend(senderId: string, requestId: string) {
  try {
    if (!userId) return;

    const res = await fetch("http://localhost:5001/friend/decline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId
      },
      body: JSON.stringify({
        sender_id: senderId
      })
    });

    if (!res.ok) {
      throw new Error("Failed to decline request");
    }

    // remove from UI
    setFriends(prev =>
      prev.filter(f => f.request_id !== requestId)
    );

  } catch (err) {
    console.error("Error declining friend:", err);
  }
}

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

        <div className ="show-user_id">
          Your user ID is: {userId}
        </div>

        <div>   
            <button className = "add-button"
                     onClick={addFriend}> Add a Friend!</button>
        </div>
        <div>
            <br></br>
        </div>

      <div className = "friend-requests-container">
        <div className="friend-list-title">
          Pending Friend Requests
        </div>        
        <div className="friend-list">
         {pendingFriends.length === 0 ? (
            <p className="no-friends-message">
              You currently have no pending friend requests.
            </p>
          ) : (
            pendingFriends.map(friend => {
              const friendId = friend.sender_id;
              return (
                <div key={friend.request_id} className="friend-row">
                  <span className="friend-name">{usernames[friendId] || friendId}</span>
                  <div className ="button-group">
                   <button
                    className="button"
                    onClick={() => acceptFriend(friend.sender_id, friend.request_id)}>
                    Accept
                  </button>

                  <button
                    className="button"
                    onClick={() => declineFriend(friend.sender_id, friend.request_id)}>
                    Decline
                  </button>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
        
      <div className = "friend-requests-container">
        <div className="friend-list-title">
        Your Friends
        </div>
        <div className="friend-list">
         {acceptedFriends.length === 0 ? (
            <p className="no-friends-message">
              You currently have no friends. Click "Add a Friend!" to get started.
            </p>
          ) : (
            acceptedFriends.map(friend => {
              const friendId =
                friend.sender_id === userId
                  ? friend.receiver_id
                  : friend.sender_id;

              return (
                <div key={friend.request_id} className="friend-row">
                  <span className="friend-name">{usernames[friendId] || friendId}</span>
                  <button className="button" onClick={() => removeFriend(friendId, friend.request_id)}>
                    Remove Friend
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer/>
    </div>
    </div>
  )
}