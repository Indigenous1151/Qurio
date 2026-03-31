
import {Link} from 'react-router-dom';
import '../details/Navbar.css';

export const Navbar = () => {
  return (
    <div className = 'header'>
      <div>
        <div>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li>|</li>
                <li><Link to="/UpdatePersonalInformation">Update Personal Information</Link></li>
                <li>|</li>
                <li><Link to="/UpdatePublicInformation">Update Public Information</Link></li>
                <li>|</li>
                <li><Link to="/view-friend-list">Friend List</Link></li>
                <li>|</li>
                <li><Link to="/personal-statistics">PersonalStatistics</Link></li>
                <li>|</li>
                <li><Link to="/logout">Logout</Link></li>
            </ul>
        </div>
      </div>
    </div>
  );
};