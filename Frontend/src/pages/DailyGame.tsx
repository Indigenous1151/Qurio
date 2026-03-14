import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';

export function DailyGame() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/game/play", {
      state: {
        category: "",
        difficulty: "",
        count: 10,
        isDaily: true, // Trivia game handles the logic for daily game
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <p className="text-[#638F77] text-lg font-semibold">Loading Daily Challenge...</p>
      </div>
      <Footer />
    </div>
  );
}