
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/UpdateInformation.css';
import { supabase } from '../supabaseClient/supabaseClient'

export function UpdatePublicInformation(){

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState(""); 

  // const handleSubmit = async () => {
  //   try {
  //     setMessage("Updating...");
      
  //     const { data, error } = await supabase
  //       .from("public_profile")
  //       .update({ username, bio })
  //       .eq("id", "31c1bf7a-ae52-4a6e-94c9-449c48a20223"); // THIS NEEDS TO CHANGE TO MATCH CURRENT USER!!!!
      
  //     if (error) {
  //       setMessage(`Error: ${error.message}`);
  //     } else {
  //       setMessage("Updated successfully!");
  //       console.log("Updated user:", data);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setMessage("Failed to update personal information");
  //   }
  // };

  const handleSubmit = async () => {
    try {
        setMessage("Updating...");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage("No user logged in");
            return;
        }

        const response = await fetch('http://localhost:5000/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': user.id
            },
            body: JSON.stringify({
                username: username,
                bio: bio
            })
        });

        const data = await response.json();

        if (response.ok) {
            setMessage("Updated successfully!");
            console.log("Updated successfully:", data);
        } else {
            setMessage(`Error: ${data.error}`);
        }
    } catch (err) {
        console.error(err);
        setMessage("Failed to update public information");
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
            Update Public Information <br />
          </h1>
          </div>
        <div className = "enter-info-box">
          <div className = "enter-info-small-box">
          <label>
            Enter new username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
            />
          </label>
          </div>
          <div className = "enter-info-small-box">
            <br></br>
          <label>
            Enter new bio:
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter bio..."
            />
          </label>
          </div>
          <br></br>
          <br></br>
          <button className = "update-button" onClick={handleSubmit}>Update Public Information</button>
          <p>{message}</p>
      </div>
      <Footer/>
    </div>
    </div>
  )
}