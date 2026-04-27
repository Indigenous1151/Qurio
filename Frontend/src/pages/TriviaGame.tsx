import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { supabase } from "../supabaseClient/supabaseClient";
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
  const { category, difficulty, count, isDaily, continueGameId } = location.state || {};
  console.log("Game state:", location.state);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answered, setAnswered] = useState(false);
  const [currency, setCurrency] = useState<number>(0);
  const [currencyError, setCurrencyError] = useState("");
  const [flashCurrencyRed, setFlashCurrencyRed] = useState(false);
  const [gameState, setGameState] = useState<null | {
    gameId: string;
    currentQuestion: Question;
    currentIndex: number;
    score: number;
    skipped: number;
    hintsUsed: number;
    totalQuestions: number;
    options: string[];
  }>(null);

  const hasFetched = useRef(false);

  const continueGame = async (existingGameId: string) => {
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
        sessionStorage.removeItem('activeGameId');
        startGame();
        return;
      }

      const data = await res.json();
      if (data.end) {
        await endGame();
        return;
      }

      const availableIncorrect = data.question.incorrect_answers.filter(
        (opt: string) => !data.question.removed_answers.includes(opt)
      );

      const game = {
        gameId: data.game_id,
        currentQuestion: data.question,
        currentIndex: data.current_index,
        score: data.score,
        skipped: data.skipped,
        hintsUsed: data.hints_used,
        totalQuestions: data.total_questions,
        options: shuffleArray([data.question.correct_answer, ...availableIncorrect])
      };

      setGameState(game);
      setLoading(false);
      setSelected(null);
      setAnswered(false);
      sessionStorage.setItem('activeGameId', data.game_id);

    } catch (err) {
      console.error('Error in continueGame:', err);
      startGame();
    }
  };

  const fetchCurrency = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return;
  
    const { data: profile, error } = await supabase
      .from("public_profile")
      .select("currency")
      .eq("user_id", user.id)
      .maybeSingle();
  
    if (error) {
      console.error("Error fetching currency:", error);
      return;
    }
  
    setCurrency(profile?.currency ?? 0);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchCurrency();

    const checkServerForActiveGame = async () => {
      const storedGameId = sessionStorage.getItem('activeGameId');

      if (storedGameId) {
        console.log("Found game in sessionStorage:", storedGameId);
        continueGame(storedGameId);
        return;
      }

      // If routing requests a continueGameId from ClassicGame, use it immediately
      if (continueGameId) {
        console.log("continueGameId found in state:", continueGameId);
        continueGame(continueGameId);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return startGame();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/active`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();

      if (data.active) {
        console.log("Found active game on server: ", data.game_id);
        continueGame(data.game_id);
      } else {
        console.log("No active game found, starting new game");
        // Only start a new game if we have valid game parameters
        if (isDaily === undefined) {
          setError("Game session expired. Please go back and select a game mode.");
          setLoading(false);
          // Navigate back to home after a short delay
          setTimeout(() => navigate('/'), 3000);
        } else {
          startGame();
        }
      }
    };

    checkServerForActiveGame();

    // Clear the location state after using it to prevent it from persisting on refresh
    if (location.state) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [continueGameId]);


  const handleSkip = async () => {
    if (answered || !gameState) return;
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
  
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: gameState.gameId })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setCurrencyError(data.error || "Not enough currency to skip a question.");
        setFlashCurrencyRed(true);
        setTimeout(() => setFlashCurrencyRed(false), 1500);
        setTimeout(() => setCurrencyError(""), 2000);
        return;
      }
  
      setGameState(prev => prev ? { ...prev, skipped: data.skipped } : null);
      setCurrencyError("");
      await fetchCurrency();
      await fetchCurrentQuestion();
    } catch (err) {
      console.error(err);
      setCurrencyError("Something went wrong while skipping.");
      setFlashCurrencyRed(true);
      setTimeout(() => setFlashCurrencyRed(false), 1500);
      setTimeout(() => setCurrencyError(""), 2000);
    }
  };

  
  useEffect(() => {
    if (gameState) {
      setSelected(null);
      setAnswered(false);
    }
  }, [gameState?.currentIndex]);

  useEffect(() => {
    if (gameState?.gameId) {
      fetchCurrentQuestion();
    }
  }, [gameState?.gameId]);

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
      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 409) {
          setError("You already completed this game.");
          return;
        }

        throw new Error(errorData.error || 'Failed to start game');
      }
      const data = await res.json();

      console.log("Start game data:", data);
      sessionStorage.setItem('activeGameId', data.game_id);
      console.log("Game ID set to:", data.game_id);
      const availableIncorrect = data.question.incorrect_answers.filter(
        (opt: string) => !data.question.removed_answers.includes(opt)
      );
      setGameState({
        gameId: data.game_id,
        currentQuestion: data.question,
        currentIndex: data.current_index,
        score: data.score,
        skipped: data.skipped,
        hintsUsed: data.hints_used,
        totalQuestions: data.total_questions,
        options: shuffleArray([data.question.correct_answer, ...availableIncorrect])
      });
      setSelected(null);
      setAnswered(false);
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("Error in startGame:", err);
      setError(err instanceof Error ? err.message : "Failed to start game.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQuestion = async (overrideGameId?: string) => {
    const activeId = overrideGameId || gameState?.gameId;
    console.log("Fetching current question, gameId:", activeId);
    if (!activeId || typeof activeId !== "string") {
      console.warn("Invalid gameId, skipping fetchCurrentQuestion");
      return;
    }
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
      const availableIncorrect = data.question.incorrect_answers.filter(
        (opt: string) => !data.question.removed_answers.includes(opt)
      );
      setGameState(prev => prev ? {
        ...prev,
        currentQuestion: data.question,
        currentIndex: data.current_index,
        score: data.score,
        skipped: data.skipped,
        hintsUsed: data.hints_used,
        options: shuffleArray([data.question.correct_answer, ...availableIncorrect])
      } : null);
    } catch (err) {
      console.error("Error in fetchCurrentQuestion:", err);
      setError("Failed to fetch question.");
    }
  };

  const endGame = async () => {
    if (!gameState) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: gameState.gameId })
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
          skipped: result.skipped || gameState.skipped,
          hints_used: result.hints_used || gameState.hintsUsed,
          category: gameState.currentQuestion?.category || "",
          difficulty: difficulty || "any",
          is_daily: isDaily
        })
      });
      sessionStorage.removeItem('activeGameId');
      navigate("/game/score", {
        state: {
          score: result.score,
          total: result.total_questions,
          skipped: result.skipped ?? gameState.skipped,
          isDaily },
      });
    } catch (err) {
      console.error("Failed to end game:", err);
    }
  };

  const handleAnswer = async (option: string) => {
    if (answered || !gameState) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ game_id: gameState.gameId, answer: option })
      });
      if (!res.ok) throw new Error('Answer failed');
      const data = await res.json();

      setSelected(option);
      setAnswered(true);
      if (data.correct) {
        setGameState(prev => prev ? { ...prev, score: prev.score + 1 } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHint = async () => {
    if (answered || !gameState) return;
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
  
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ game_id: gameState.gameId })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setCurrencyError(data.error || "Not enough currency for a hint.");
        setFlashCurrencyRed(true);
        setTimeout(() => setFlashCurrencyRed(false), 1500);
        setTimeout(() => setCurrencyError(""), 2000);
        return;
      }
  
      const q = data;
      await fetchCurrency();
  
      const availableIncorrect = q.incorrect_answers.filter(
        (opt: any) => !q.removed_answers.includes(opt)
      );
  
      setGameState(prev => prev ? {
        ...prev,
        currentQuestion: q,
        hintsUsed: prev.hintsUsed + 1,
        options: shuffleArray([q.correct_answer, ...availableIncorrect])
      } : null);
  
      setCurrencyError("");
    } catch (err) {
      console.error(err);
      setCurrencyError("Something went wrong while buying a hint.");
      setFlashCurrencyRed(true);
      setTimeout(() => setFlashCurrencyRed(false), 1500);
      setTimeout(() => setCurrencyError(""), 2000);
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
          onClick={() => navigate("/")}
        >
          Go Back
        </button>
      </div>
      <Footer />
    </div>
  );

  if (!gameState) return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <p className="text-[#638F77] text-lg font-semibold">Loading question...</p>
      </div>
      <Footer />
    </div>
  );

  const q = gameState.currentQuestion;
  const progress = Math.round(((gameState.currentIndex + 1) / gameState.totalQuestions) * 100);

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
          

        <div className="flex justify-center mt-1 mb-2">
        <div
          className={`inline-flex items-center gap-3 rounded-lg px-4 py-2 shadow-sm border transition-all duration-200 ${
            flashCurrencyRed
              ? "bg-red-100 border-red-300"
              : "bg-[#eef4f0] border-[#d8e2db]"
          }`}
        >
          <span className="text-xl">💰</span>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-widest text-[#888]">
              Currency
            </div>
            <div
              className={`font-extrabold text-base sm:text-lg ${
                flashCurrencyRed ? "text-red-700" : "text-[#638F77]"
              }`}
            >
              {currency}
            </div>
          </div>
        </div>
      </div>

      {currencyError && (
        <div className="text-red-200 text-sm font-medium text-center -mt-1 mb-1">
          {currencyError}
        </div>
      )}

          <div className="flex justify-between items-center text-white text-sm">
            <span className="font-semibold">Question {gameState.currentIndex + 1} of {gameState.totalQuestions}</span>
            <span className="font-semibold">Score: {gameState.score}</span>
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
            {gameState.options.map((opt, i) => {
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
                  {gameState.currentIndex + 1 >= gameState.totalQuestions ? "See Results" : "Next"}
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