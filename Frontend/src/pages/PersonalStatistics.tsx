import { useEffect, useState } from "react";
import "../details/PersonalStatistics.css";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';

  export function PersonalStatistics() {
 
    return (
      <div className="min-h-screen bg-[#f5f0e8]">
        <Navbar />
          <div className="statistics-page">
            <p>Welcome to the Personal Statistics Page</p>
          </div>
        <Footer />
      </div>
      
    );
  }