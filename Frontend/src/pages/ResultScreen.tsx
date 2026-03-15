import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';

export function ResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, skipped, isDaily } = location.state || {};

  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect Score! 🏆";
    if (percentage >= 80) return "Great Job! 🎉";
    if (percentage >= 60) return "Not Bad! 👍";
    if (percentage >= 40) return "Keep Practicing! 💪";
    return "Better Luck Next Time! 🎯";
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-20 pb-20">

        <h1 className="text-3xl font-bold text-center text-[#1a1a1a] mb-8">
          {getMessage()}
        </h1>

        <div className="bg-[#638F77] rounded-2xl p-8 flex flex-col items-center gap-6">

          {/* Big score */}
          <div className="bg-white rounded-2xl px-12 py-6 text-center">
            <span className="text-6xl font-black text-[#638F77]">{score}</span>
            <span className="text-3xl text-gray-400">/{total}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {[
              { label: "Accuracy", value: `${percentage}%` },
              { label: "Correct", value: score },
              { label: "Wrong", value: total - score - skipped },
              { label: "Skipped", value: skipped },
            ].map((s) => (
              <div key={s.label} className="bg-white/20 rounded-xl p-3 text-center text-white">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs uppercase tracking-wide opacity-80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

         
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            {!isDaily && (
              <button
                onClick={() => navigate("/game/setup")}
                className="flex-1 bg-white text-[#638F77] font-bold py-3 rounded-xl hover:bg-gray-100 cursor-pointer border-none"
              >
                Play Again
              </button>
            )}
            <button
              onClick={() => navigate("/game/daily")}
              className="flex-1 bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 cursor-pointer border-none"
            >
              Daily Challenge
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 cursor-pointer border-none"
            >
              Home
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}