import { Link } from 'react-router-dom';
import '../details/Navbar.css';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient/supabaseClient';
import { BugReportModal } from './BugReportModal';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const navRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;
      if (!session?.access_token) {
        setIsAdmin(false);
        setAdminChecked(true);
        return;
      }

      const res = await fetch(`${API_URL}/payment/admin/is-admin`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      if (!mounted) return;
      if (res.status === 401) {
        setIsAdmin(false);
        setAdminChecked(true);
        return;
      }

      const json = await res.json();
      setIsAdmin(json.is_admin === true);
      setAdminChecked(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        checkAdmin();
      } else {
        setIsAdmin(false);
        setAdminChecked(true);
      }
    });

    checkAdmin();

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Close dropdowns when clicking outside the navbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleNavClick = () => {
    setOpen(false);
    setDropdown(null);
  };

  const toggleDropdown = (name) => {
    setDropdown(dropdown === name ? null : name);
  };

  return (
    <div className="header" ref={navRef}>
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰ Menu
      </div>

      <ul className={`nav-list ${open ? 'open' : ''}`}>

        <li>
          <Link to="/" onClick={handleNavClick}>Home</Link>
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
            <li><Link to="/user-information" onClick={handleNavClick}>User Information</Link></li>
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
            <li><Link to="/admin/dashboard" onClick={handleNavClick}>Admin Dashboard</Link></li>
            <li><Link to="/admin/payment-logs" onClick={handleNavClick}>Payment Logs</Link></li>
            <li><Link to="/admin/get-reports" onClick={handleNavClick}>Bug Reports</Link></li>
          </ul>
        </li>
        )}

        {/* Purchase Currency*/}
        <li><Link to="/get-currency" onClick={handleNavClick}>Purchase Currency</Link></li>
        
        {/* Report a Bug */}
        <li>
          <span
            className="nav-item"
            onClick={() => {
              setIsBugReportOpen(true);
              setOpen(false);
            }}
            style={{ cursor: 'pointer' }}
          >
            Report a Bug
          </span>
        </li>

        {/* Logout */}
        <li>
          <Link to="/logout" onClick={handleNavClick}>Logout</Link>
        </li>
       

      </ul>

      <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
    </div>
  );
};