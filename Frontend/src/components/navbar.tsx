import { Link } from 'react-router-dom';
import '../details/Navbar.css';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient/supabaseClient';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
  
      if (!session?.access_token) {
        setIsAdmin(false);
        return;
      }
  
      const res = await fetch(`${API_URL}/payment/admin/is-admin`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });
  
      const json = await res.json();
      setIsAdmin(json.is_admin === true);
    }
  
    checkAdmin();
  }, []);

  const handleNavClick = () => {
    setOpen(false);
    setDropdown(null);
  };

  const toggleDropdown = (name) => {
    setDropdown(dropdown === name ? null : name);
  };

  return (
    <div className="header">
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰ Menu
      </div>

      <ul className={`nav-list ${open ? 'open' : ''}`}>

        <li>
          <Link to="/" onClick={handleNavClick}>Home</Link>
        </li>

        <li>
          <Link to="/get-currency" onClick={handleNavClick}>
            Purchase Currency
          </Link>
        </li>

        {/* Profile */}
        <li className="dropdown">
          <span
            className="nav-item"
            onClick={() => toggleDropdown('profile')}
          >
            Profile ▾
          </span>

          <ul className={`dropdown-menu ${dropdown === 'profile' ? 'show' : ''}`}>
            <li><Link to="/UpdatePersonalInformation" onClick={handleNavClick}>Personal Info</Link></li>
            <li><Link to="/UpdatePublicInformation" onClick={handleNavClick}>Public Info</Link></li>
            <li><Link to="/personal-statistics" onClick={handleNavClick}>Statistics</Link></li>
          </ul>
        </li>

        {/* Social */}
        <li className="dropdown">
          <span
            className="nav-item"
            onClick={() => toggleDropdown('social')}
          >
            Social ▾
          </span>

          <ul className={`dropdown-menu ${dropdown === 'social' ? 'show' : ''}`}>
            <li><Link to="/view-friend-list" onClick={handleNavClick}>Friends</Link></li>
            <li><Link to="/groups" onClick={handleNavClick}>Groups</Link></li>
            <li><Link to="/view-notifications" onClick={handleNavClick}>Notifications</Link></li>
          </ul>
        </li>

        {/* Admin */}
        {isAdmin && (
          <li className="dropdown">
            <span
              className="nav-item"
              onClick={() => toggleDropdown('admin')}
            >
              Admin ▾
            </span>

            <ul className={`dropdown-menu ${dropdown === 'admin' ? 'show' : ''}`}>
              <li><Link to="/admin/payment" onClick={handleNavClick}>Configure Payment</Link></li>
            </ul>
          </li>
        )}

        {/* Logout */}
        <li>
          <Link to="/logout" onClick={handleNavClick}>Logout</Link>
        </li>
       

      </ul>
    </div>
  );
};