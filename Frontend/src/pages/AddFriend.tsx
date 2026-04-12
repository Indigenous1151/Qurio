import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/AddFriend.css';
import { supabase } from '../supabaseClient/supabaseClient'

export function AddFriend(){

  const [receiverId, setReceiverId] = useState(""); 
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
  e.preventDefault();

  if (!receiverId) {
    setMessage("Please enter a friend's user ID.");
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in to add friends.");
      return;
    }

    if (receiverId === user.id) {
      setMessage("You cannot add yourself as a friend.");
      return;
    }

    const response = await fetch("http://localhost:5001/friend/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": user.id
      },
      body: JSON.stringify({ receiver_id: receiverId })
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message || "Friend request sent successfully!");
      setReceiverId(""); 
    } else {
      setMessage("Failed to send friend request: " + (data.error || "Unknown error"));
    }

  } catch (err) {
    console.error("Error sending friend request:", err);
    setMessage("An unexpected error occurred.");
  }
};

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
            Add a New Friend! <br />
          </h1>
        </div>
      <div className = "enter-info-box">
        <div className = "instruction-text">
            Friend's userID can be found on their "Friend List" page.
        </div>
      <div className = "enter-info-small-box">
        
         <form onSubmit={handleSubmit}>
          Enter friend's user ID: 
            <input
              type="text"
              placeholder="Enter friend's user ID"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
            />
            <br></br>
            <br></br>
            <button type="submit" className="update-button">Add Friend</button>
            {message && <p>{message}</p>}
          </form>
      </div>  
      </div>

      <Footer/>
    </div>
    </div>
  )
}

