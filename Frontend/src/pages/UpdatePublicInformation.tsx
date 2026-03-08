
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import '../details/UpdateInformation.css';


export function UpdatePublicInformation(){

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = () => {
    console.log("Form submitted with value:", username, bio);
  }

  return(
  <div>
    <Navbar></Navbar>
      <h1 className = "update-personal-info-title">Update Personal Information!</h1>
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
        <div>
        <button className = "update-button" onClick={handleSubmit}>Update Public Information</button>
      </div>
      </div>
      <Footer></Footer>
    </div>
  )
}
