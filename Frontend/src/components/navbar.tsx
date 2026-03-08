
import {Link} from 'react-router-dom';
import '../details/Navbar.css';

export const Navbar = () => {
  return (
    <div className = 'header'>
      <div>
        <div>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/UpdatePersonalInformation">Update Personal Information</Link></li>
            </ul>
        </div>
      </div>
    </div>
  );
};