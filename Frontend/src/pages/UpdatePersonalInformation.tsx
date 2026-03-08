
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import '../details/UpdateInformation.css';


export function UpdatePersonalInformation(){

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    console.log("Form submitted with value:", name, password, email);
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