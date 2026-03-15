import { Link } from 'react-router-dom';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';

export function Home() {
  return (
   <div className="min-h-screen bg-[#f5f0e8] pt-20 pb-20" style={{ fontFamily: "'Georgia', serif" }}>
      <Navbar />

      <div className="relative overflow-hidden">
       
        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">

         
          <div className="inline-block bg-[#638F77] text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            Daily Trivia · Classic Mode
          </div>

         
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            Welcome back, <br />
            <span className="text-[#638F77]">USERNAME</span>
          </h1>

          <p className="text-[#555] text-base sm:text-lg max-w-md mx-auto mb-10 sm:mb-12">
            Test your knowledge, challenge yourself daily, and climb the leaderboard.
          </p>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">

            
            <div className="bg-[#638F77] rounded-2xl p-6 sm:p-8 text-left text-white shadow-lg">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎯</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                Classic Game
              </h2>
              <p className="text-white/80 text-sm mb-5 sm:mb-6">
                Choose your category, difficulty, and number of questions. Play at your own pace.
              </p>
              <Link to="/game/setup">
                <button className="inline-flex items-center gap-2 bg-white text-[#638F77] font-bold text-sm px-5 py-2.5 rounded-full hover:gap-3 transition-all duration-200 cursor-pointer border-none">
                  Play Now
                </button>
              </Link>
            </div>

           <div className="bg-[#638F77] rounded-2xl p-6 sm:p-8 text-left text-white shadow-lg">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📅</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                Daily Challenge
              </h2>
              <p className="text-white/70 text-sm mb-5 sm:mb-6">
                A fresh set of questions every day.
              </p>
              <Link to="/game/daily">
                <button className="inline-flex items-center gap-2 bg-white text-[#638F77] font-bold text-sm px-5 py-2.5 rounded-full hover:gap-3 transition-all duration-200 cursor-pointer border-none">
                  Play Now
                </button>
              </Link>
            </div>

          </div>

          
          <div className="flex justify-center gap-6 sm:gap-12 mt-12 sm:mt-16 mb-10 flex-wrap">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#638F77]">10</div>
              <div className="text-xs text-[#888] uppercase tracking-widest mt-1">Questions / Day</div>
            </div>
            <div className="w-px bg-[#ddd] hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#638F77]">16+</div>
              <div className="text-xs text-[#888] uppercase tracking-widest mt-1">Categories</div>
            </div>
            <div className="w-px bg-[#ddd] hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#638F77]">3</div>
              <div className="text-xs text-[#888] uppercase tracking-widest mt-1">Difficulty Levels</div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}