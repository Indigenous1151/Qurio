
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/UpdateInformation.css';
import { supabase } from '../supabaseClient/supabaseClient.js';

export function UpdatePersonalInformation(){

  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); 

const handleSubmit = async () => {
  try {
    setMessage("Updating...");
    
    const { data, error } = await supabase
      .from("users")
      .update({ full_name, email })
      .eq("id", "fd261c55-e149-43cf-9a8c-2a259b64ed58"); // THIS NEEDS TO CHANGE TO MATCH CURRENT USER!!!!
    
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Updated successfully!");
      console.log("Updated user:", data);
    }
  } catch (err) {
    console.error(err);
    setMessage("Failed to update personal information");
  }
};

  return(
  <div>
    <Navbar></Navbar>
      <h1 className = "update-info-title">Update Personal Information!</h1>
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
        <button className = "update-button" onClick={handleSubmit}>Update Personal Information</button>
        <p>{message}</p>
      </div>
      <Footer></Footer>
    </div>
  )
}