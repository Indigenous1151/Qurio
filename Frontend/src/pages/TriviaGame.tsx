import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { supabase } from "../client/supabase";
import { useRef } from "react";


interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  removed_answers: string[];
  type: string;
  difficulty: string;
  category: string;
}

function decodeHTML(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(arr: string[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function TriviaGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category, difficulty, count, isDaily } =location.state|| {};
console.log("Game state:", location.state);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answered, setAnswered] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);

  const hasFetched = useRef(false);
useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;
  fetchQuestions(); 
}, []);


const handleSkip = () => {
  if (answered) return;
  const newSkipped = skipped + 1;
  setSkipped(newSkipped);
  if (current + 1 >= questions.length) {
    
    //to save result when skipping last question
    const saveResult = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch(`${import.meta.env.VITE_API_URL}/game/result`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': user.id
            },
            body: JSON.stringify({
              score: score,
              total: questions.length,
              skipped: skipped,
              hints_used: hintsUsed,
              category: questions[0]?.category || "",
              difficulty: difficulty || "any",
              is_daily: isDaily
            })
          });
        }
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    };
    saveResult();

    navigate("/game/score", {
      state: { score, total: questions.length, skipped: newSkipped, isDaily },
    });
  } else {
    setCurrent((c) => c + 1);
  }
};

  
  useEffect(() => {
    if (questions.length > 0 && current < questions.length) {
      const q = questions[current];
      setOptions(shuffleArray([q.correct_answer, ...q.incorrect_answers]));
      setSelected(null);
      setAnswered(false);
    }
  }, [current, questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let url = `https://opentdb.com/api.php?amount=${count || 10}&type=multiple`;
      if (category) url += `&category=${category}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.response_code === 0) {
        setQuestions(data.results);
      } else {
        setError("Could not load questions. Try different settings.");
      }
    } catch {
      setError("Failed to connect to trivia API.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === questions[current].correct_answer) {
      setScore((s) => s + 1);
    }
  };

const handleHint = async () => {
  console.log("DEBUG: In handleHint")
  // check if hint is necessary
  if (answered || current >= questions.length)
  {
    console.log("DEBUG: gameID=" + gameId + " answered=" + answered + " current=" + current + " questions.length=" + questions.length);
    return;
  }
  console.log("DEBUG: debug is necessary")
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("before user");
    if (!user) return;
    console.log("not user passed");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,
      },
      body: JSON.stringify({ game_id: gameId })
    });

    if (!res.ok) throw new Error('Hint failed');
    const q = await res.json(); // updated question from backend
    console.log("HINT RESPONSE:", q);
    console.log("Removed answers:", q.removed_answers);
    setHintsUsed((h) => h + 1);

    setQuestions((prev) => 
      prev.map((item, idx) => (idx === current ? q : item))
    );

    const availableIncorrect = q.incorrect_answers.filter(
      (opt) => !q.removed_answers.includes(opt)
    );

    console.log("AvailableIncorrect" + availableIncorrect);
    setOptions(shuffleArray([q.correct_answer, ...availableIncorrect]));
  } catch (err) {
    console.error(err);
  }
};

  const handleNext = () => {
    console.log("handleNext called, current:", current, "total:", questions.length);
    if (current + 1 >= questions.length) {
    console.log("Game over, saving result...");
    const saveResult = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User:", user);


  
    
   
    
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("User in saveResult:", user);
        if (user) {
          await fetch(`${import.meta.env.VITE_API_URL}/game/result`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': user.id
            },
            body: JSON.stringify({
              score: score,
              total: questions.length,
              skipped: skipped,
              category: questions[0]?.category || "",
              difficulty: difficulty || "any",
              is_daily: isDaily,
              hints_used: hintsUsed
            })
          });
        }
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    };

    saveResult();

    navigate("/game/score", {
      state: { score, total: questions.length, skipped, isDaily },
    });
  } else {
    setCurrent((c) => c + 1);
  }
};
  

  if (loading) return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <p className="text-[#638F77] text-lg font-semibold">Loading questions...</p>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          className="bg-[#638F77] text-white px-6 py-2 rounded-lg cursor-pointer border-none"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
      <Footer />
    </div>
  );

  const q = questions[current];
  const progress = Math.round((current / questions.length) * 100);

  const diffColor: Record<string, string> = {
    easy: "text-green-700 bg-green-100",
    medium: "text-yellow-700 bg-yellow-100",
    hard: "text-red-700 bg-red-100",
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-20">

        <h1 className="text-2xl font-bold text-center text-[#1a1a1a] mb-6">
          {isDaily ? "Daily Challenge" : "Classic Game"}
        </h1>

        <div className="bg-[#638F77] rounded-2xl p-6 sm:p-8 flex flex-col gap-5">

          
          <div className="flex justify-between items-center text-white text-sm">
            <span className="font-semibold">Question {current + 1} of {questions.length}</span>
            <span className="font-semibold">Score: {score}</span>
          </div>

         
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-xs italic">{decodeHTML(q.category)}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${diffColor[q.difficulty]}`}>
              {q.difficulty}
            </span>
          </div>

         
          <div className="bg-white rounded-xl p-5 text-[#1a1a1a] text-base font-medium text-center leading-relaxed">
            {decodeHTML(q.question)}
          </div>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, i) => {
              let cls = "w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2 transition-all cursor-pointer border-none ";
              if (!answered) {
                cls+= "bg-white text-[#1a1a1a] hover:bg-gray-100";
              } else if(opt === q.correct_answer) {
                cls += "bg-green-100 text-green-800 border-2 border-green-500";
              } else if (opt === selected) {
                cls += "bg-red-100 text-red-800 border-2 border-red-400";
              } else {
                cls += "bg-white/50 text-white/60";
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                  <span className="font-bold min-w-[20px]">{String.fromCharCode(65 + i)}.</span>
                  {decodeHTML(opt)}
                </button>
              );
            })}
          </div>

          
          <div className="flex justify-between items-center mt-1">
            {!answered ? (
              <>
                <button
                  onClick={handleHint}
                  disabled={answered}
                  className="px-5 py-2 rounded-lg text-sm text-white border border-white/50 bg-transparent hover:bg-white/10 cursor-pointer"
                >
                  Hint
                </button>

                <button
                  onClick={handleSkip}
                  className="px-5 py-2 rounded-lg text-sm text-white border border-white/50 bg-transparent hover:bg-white/10 cursor-pointer"
                >
                  Skip
                </button>
              </>
            ) : (
              <div className="ml-auto">
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-[#638F77] hover:bg-gray-100 cursor-pointer border-none"
                >
                  {current + 1 >= questions.length ? "See Results" : "Next"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}