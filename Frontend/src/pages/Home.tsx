import {Link} from 'react-router-dom';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';


export function Home() {
  return (
    <div>
      <Navbar />
      <h1 className="center-title">Welcome to Qurio!</h1>
      <Footer></Footer>
    </div>
  );
}