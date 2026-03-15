
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
    <Navbar></Navbar>
      <h1 className = "update-info-title">Update Public Information!</h1>
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
        <button className = "update-button" onClick={handleSubmit}>Update Public Information</button>
        <p>{message}</p>
      </div>
      <Footer></Footer>
    </div>
  )
}