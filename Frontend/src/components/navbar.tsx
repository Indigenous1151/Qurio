
import {Link} from 'react-router-dom';
import '../details/Navbar.css';
import { useState } from 'react';

export const Navbar = () => {
   const [open, setOpen] = useState(false);
  return (
    <div className="header">

      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰ Menu
      </div>
       <ul className={`nav-list ${open ? "open" : ""}`}>
        <li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
        <li><Link to = "/get-currency" onClick={() => setOpen(false)}>Purchase Currency</Link></li>
        <li><Link to="/UpdatePersonalInformation" onClick={() => setOpen(false)}>Update Personal Information</Link></li>
        <li><Link to="/UpdatePublicInformation" onClick={() => setOpen(false)}>Update Public Information</Link></li>
        <li><Link to="/view-friend-list" onClick={() => setOpen(false)}>Friend List</Link></li>
        <li><Link to="/groups" onClick={() => setOpen(false)}>Groups</Link></li>
        <li><Link to="/personal-statistics" onClick={() => setOpen(false)}>Personal Statistics</Link></li>
        <li><Link to="/view-notifications" onClick={() => setOpen(false)}>Notifications</Link></li>
        <li><Link to="/logout" onClick={() => setOpen(false)}>Logout</Link></li>
      </ul>
    </div>
  );
};