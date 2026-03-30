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
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
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
const continueGame = async (existingGameId: string) => {
  console.log('continueGame called with existingGameId:', existingGameId);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/continue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ game_id: existingGameId })
    });

    if (!res.ok) {
      console.log('Continue game failed, starting new game');
      sessionStorage.removeItem('activeGameId');
      startGame();
      return;
    }

    const data = await res.json();
    if (data.end) {
      await endGame();
      return;
    }

    setGameId(data.game_id);
    sessionStorage.setItem('activeGameId', data.game_id);
    setCurrentQuestion(data.question);
    setCurrentIndex(data.current_index);
    setScore(data.score);
    setSkipped(data.skipped);
    setHintsUsed(data.hints_used);
    setTotalQuestions(data.total_questions);
    const availableIncorrect = data.question.incorrect_answers.filter(
      (opt: string) => !data.question.removed_answers.includes(opt)
    );
    setOptions(shuffleArray([data.question.correct_answer, ...availableIncorrect]));

  } catch (err) {
    console.error('Error in continueGame:', err);
    startGame();
  }
};

useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;
  const existingGameId = sessionStorage.getItem('activeGameId');
  console.log('On mount - existingGameId:', existingGameId, 'location.state:', location.state);
  if (existingGameId && !location.state) {
    // Only resume if no new game state provided
    console.log('Resuming existing game from sessionStorage', existingGameId);
    continueGame(existingGameId);
  } else {
    // If new game state provided or no existing game, start new game
    if (existingGameId) {
      console.log('Ending existing game before starting new one');
      // Optionally end the existing game here, but for now just clear sessionStorage
      sessionStorage.removeItem('activeGameId');
    }
    startGame();
  }
  // Clear the location state after using it to prevent it from persisting on refresh
  if (location.state) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}, []);


const handleSkip = async () => {
  if (answered || !gameId) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ game_id: gameId })
    });
    if (!res.ok) throw new Error('Skip failed');
    const skipData = await res.json();
    setSkipped(skipData.skipped);
    await fetchCurrentQuestion();
  } catch (err) {
    console.error(err);
  }
};

  
  useEffect(() => {
    if (currentQuestion) {
      const availableIncorrect = currentQuestion.incorrect_answers.filter(
        (opt) => !currentQuestion.removed_answers.includes(opt)
      );
      setOptions(shuffleArray([currentQuestion.correct_answer, ...availableIncorrect]));
      setSelected(null);
      setAnswered(false);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (gameId) {
      fetchCurrentQuestion();
    }
  }, [gameId]);

  const startGame = async () => {
    console.log("Starting game...");
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session:", session);
      if (!session?.access_token) {
        setError("User not authenticated");
        return;
      }
      const endpoint = isDaily ? '/game/daily' : '/game/classic';
      console.log("Calling endpoint:", endpoint);
      const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
      console.log("Full URL:", url);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          category: category,
          difficulty: difficulty,
          count: count
        })
      });
      console.log("Response status:", res.status);
      if (!res.ok) throw new Error('Failed to start game');
      const data = await res.json();

      console.log("Start game data:", data);
      setGameId(data.game_id);
      sessionStorage.setItem('activeGameId', data.game_id);
      console.log("Game ID set to:", data.game_id);
      setCurrentQuestion(data.question);
      setCurrentIndex(data.current_index);
      setScore(data.score);
      setSkipped(data.skipped);
      setHintsUsed(data.hints_used);
      setTotalQuestions(data.total_questions);
      const availableIncorrect = data.question.incorrect_answers.filter(
        (opt: string) => !data.question.removed_answers.includes(opt)
      );
      setOptions(shuffleArray([data.question.correct_answer, ...availableIncorrect]));
    } catch (err) {
      console.error("Error in startGame:", err);
      setError("Failed to start game.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQuestion = async (overrideGameId?: string) => {
    const activeId = overrideGameId || gameId;
    console.log("Fetching current question, gameId:", activeId);
    if (!activeId) return;
    setGameId(activeId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/current-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: activeId })
      });
      console.log("Current question response status:", res.status);
      if (!res.ok) throw new Error('Failed to fetch question');
      const data = await res.json();
      console.log("Current question data:", data);
      if (data.end) {
        // Game over
        await endGame();
        return;
      }
      setCurrentQuestion(data.question);
      setCurrentIndex(data.current_index);
      setScore(data.score);
      setSkipped(data.skipped);
      setHintsUsed(data.hints_used);
      const availableIncorrect = data.question.incorrect_answers.filter(
        (opt: string) => !data.question.removed_answers.includes(opt)
      );
      setOptions(shuffleArray([data.question.correct_answer, ...availableIncorrect]));
      setSelected(null);
      setAnswered(false);
    } catch (err) {
      console.error("Error in fetchCurrentQuestion:", err);
      setError("Failed to fetch question.");
    }
  };

  const endGame = async () => {
    if (!gameId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: gameId })
      });
      if (!res.ok) throw new Error('End game failed');
      const result = await res.json();
      // Now save result
      await fetch(`${import.meta.env.VITE_API_URL}/game/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          score: result.score,
          total: result.total_questions,
          skipped: result.skipped || skipped,
          hints_used: result.hints_used || hintsUsed,
          category: currentQuestion?.category || "",
          difficulty: difficulty || "any",
          is_daily: isDaily
        })
      });
      sessionStorage.removeItem('activeGameId');
      navigate("/game/score", {
        state: { score: result.score, total: result.total_questions, skipped: result.skipped || skipped, isDaily },
      });
    } catch (err) {
      console.error("Failed to end game:", err);
    }
  };

  const handleAnswer = async (option: string) => {
    if (answered || !gameId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: gameId, answer: option })
      });
      if (!res.ok) throw new Error('Answer failed');
      const data = await res.json();
      setSelected(option);
      setAnswered(true);
      if (data.correct) {
        setScore((s) => s + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

const handleHint = async () => {
  console.log("DEBUG: In handleHint")
  // check if hint is necessary
  if (answered || !gameId || !currentQuestion)
  {
    console.log("DEBUG: gameID=" + gameId + " answered=" + answered + " currentQuestion=" + currentQuestion);
    return;
  }
  console.log("DEBUG: debug is necessary")
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session in hint:", session);
    if (!session?.access_token) return;
    console.log("not session passed");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ game_id: gameId })
    });

    if (!res.ok) throw new Error('Hint failed');
    const q = await res.json(); // updated question from backend
    console.log("HINT RESPONSE:", q);
    console.log("Removed answers:", q.removed_answers);
    setHintsUsed((h) => h + 1);
    setCurrentQuestion(q);
    const availableIncorrect = q.incorrect_answers.filter(
      (opt) => !q.removed_answers.includes(opt)
    );
    console.log("AvailableIncorrect" + availableIncorrect);
    setOptions(shuffleArray([q.correct_answer, ...availableIncorrect]));
  } catch (err) {
    console.error(err);
  }
};

  const handleNext = async () => {
    console.log("handleNext called");
    await fetchCurrentQuestion();
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

  if (!currentQuestion) return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <p className="text-[#638F77] text-lg font-semibold">Loading question...</p>
      </div>
      <Footer />
    </div>
  );

  const q = currentQuestion;
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

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
            <span className="font-semibold">Question {currentIndex + 1} of {totalQuestions}</span>
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
                  {currentIndex + 1 >= totalQuestions ? "See Results" : "Next"}
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