import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/UpdateInformation.css';
import { supabase } from '../supabaseClient/supabaseClient.js';

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session?.access_token}`
  };
}

export function UpdatePersonalInformation(){

  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");


  const handleSubmit = async () => {
    try {
        // // temporary login for testing - remove later
        // await supabase.auth.signInWithPassword({
        //     email: 'newuser2@gmail.com',
        //     password: 'abc'
        // });

        // const { data: { user } } = await supabase.auth.getUser();

        const { data: { user } } = await supabase.auth.getUser();
        console.log("Current user ID:", user?.id); 
        if (!user) {
            console.error("No user logged in");
            return;
        }

        const headers = await getAuthHeader();
        const response = await fetch('http://localhost:5001/user/personal', {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                full_name: full_name,
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
    <Navbar/>
      <h1 className = "update-info-title"></h1>
       <div className="relative overflow-hidden">
             
        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}>
            Update Personal Information <br />
          </h1>
          </div>
      <div className = "enter-info-box">
        <div className = "enter-info-small-box">
        <label>
          Enter new name:
          <input
            type="text"
            value={full_name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
          />
        </label>
        </div>
     
        <div className = "enter-info-small-box">
        <br></br>
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
        <br></br>
        <br></br>
        <button className = "update-button" onClick={handleSubmit}>Update Personal Information</button>
        <p>{message}</p>   
      </div>
      <Footer/>
    </div>
    </div>
    )
}