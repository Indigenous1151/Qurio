
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import '../details/UpdateInformation.css';
import { supabase } from "../SupabaseClient";

export function UpdatePersonalInformation(){

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");


  const handleSubmit = async () => {
    try {
        // // temporary login for testing - remove later
        // await supabase.auth.signInWithPassword({
        //     email: 'newuser2@gmail.com',
        //     password: 'abc'
        // });

        // const { data: { user } } = await supabase.auth.getUser();
        
        const { data: { user } } = await supabase.auth.getUser();
        //console.log("Current user ID:", user?.id); -- remove later, just for testing
        if (!user) {
            console.error("No user logged in");
            return;
        }

        const response = await fetch('http://localhost:5000/user/personal', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': user.id
            },
            body: JSON.stringify({
                full_name: name,
                email: email
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Updated successfully:", data);
        } else {
            console.error("Error:", data.error);
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}

  return(
  <div>
    <Navbar></Navbar>
      <h1 className = "update-personal-info-title">Update Personal Information!</h1>
      <div className = "enter-info-box">
        <div className = "enter-info-small-box">
        <label>
          Enter new name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
          />
        </label>
        </div>
        <div className = "enter-info-small-box">
        <label>
          Enter new password:
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
          />
        </label>
        </div>
        <div className = "enter-info-small-box">
        <label>
          Enter new email:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email..."
          />
        </label>
        </div>
        <div>
        <button className = "update-button" onClick={handleSubmit}>Update Personal Information</button>
      </div>
      </div>
      <Footer></Footer>
    </div>
  )
}