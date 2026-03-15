import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';

const CATEGORIES = [
  { id: 9, name: "General Knowledge" },
  { id: 10, name: "Books" },
  { id: 11, name: "Film" },
  { id: 12, name: "Music" },
  { id: 14, name: "Television" },
  { id: 15, name: "Video Games" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Computers" },
  { id: 19, name: "Mathematics" },
  { id: 20, name: "Mythology" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" },
  { id: 24, name: "Politics" },
  { id: 25, name: "Art" },
  { id: 27, name: "Animals" },
];

const DIFFICULTIES = ["easy", "medium", "hard"];
const QUESTION_COUNTS = [5, 10, 15, 20];

export function ClassicGame() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(10);

  const handleStart = () => {
    navigate("/game/play", {
      state: { category, difficulty, count, isDaily: false },
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-20 pb-20">
        <h1 className="text-3xl font-bold text-center text-[#1a1a1a] mb-8">
          Classic Game Setup
        </h1>

        <div className="bg-[#638F77] rounded-2xl p-8 flex flex-col gap-6">

          
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm uppercase tracking-wide">
              Category
            </label>
            <select
              className="bg-white text-black rounded-lg px-4 py-2.5 text-sm w-full cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Any Category</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm uppercase tracking-wide">
              Difficulty
            </label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(difficulty === d ? "" : d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer border-none
                    ${difficulty === d
                      ? "bg-white text-[#638F77]"
                      : "bg-white/30 text-white hover:bg-white/50"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm uppercase tracking-wide">
              Number of Questions
            </label>
            <div className="flex gap-3">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none
                    ${count === n
                      ? "bg-white text-[#638F77]"
                      : "bg-white/30 text-white hover:bg-white/50"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          
          <button
            onClick={handleStart}
            className="w-full bg-white text-[#638F77] font-bold py-3 rounded-xl text-base mt-2 hover:bg-gray-100 transition-all cursor-pointer border-none"
          >
            Start Game 
          </button>

        </div>
      </div>
      <Footer />
    </div>
  );
}