import {Link} from 'react-router-dom';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';


export function Home() {
  return (
    <div>
      <Navbar />
      <h1 className="center-title">Welcome to Qurio, USERNAME!</h1>
      <Footer></Footer>
    </div>
  );
}