import { Link } from 'react-router-dom';
import '../details/Navbar.css';
import { useState } from 'react';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);

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
        <li className="dropdown">
          <span
            className="nav-item"
            onClick={() => toggleDropdown('admin')}
          >
            Admin ▾
          </span>

          <ul className={`dropdown-menu ${dropdown === 'admin' ? 'show' : ''}`}>
            <li><Link to="/admin/payment" onClick={handleNavClick}>Configure Payment</Link></li>
            <li><Link to="/admin/payment-logs" onClick={handleNavClick}>Payment Logs</Link></li>
          </ul>
        </li>

        <li>
          <Link to="/logout" onClick={handleNavClick}>Logout</Link>
        </li>

      </ul>
    </div>
  );
};