import { useEffect, useState } from "react";
import "../details/PersonalStatistics.css";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { useAuth } from "../client/AuthProvider";

type Statistics = {
  username: string;
  games_played: number;
  daily_games_played: number;
  classic_games_played: number;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  average_score: number;
  rank: number;
};

export function PersonalStatistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------
        // TEMPORARY MOCK DATA
        // Replace this later with backend fetch
        // -----------------------------------------
        // const mockData: Statistics = {
        //   username: "Ashley",
        //   games_played: 42,
        //   daily_games_played: 12,
        //   classic_games_played: 30,
        //   questions_answered: 380,
        //   correct_answers: 301,
        //   accuracy: 79.21,
        //   average_score: 7.17,
        //   rank: 5,
        // };

        // // Simulate loading delay
        // await new Promise((resolve) => setTimeout(resolve, 500));

        // setStats(mockData);

        // -----------------------------------------
        // REAL BACKEND VERSION LATER
        // -----------------------------------------
        
        if (!user) {
          throw new Error("User not logged in.");
        }

        const response = await fetch("http://127.0.0.1:5000/api/statistics/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.id,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch statistics.");
        }

        setStats(data);
    
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchStatistics();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="statistics-container">
          <h1 className="statistics-title">Personal Statistics</h1>
          <p className="statistics-status">Loading your statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-page">
        <div className="statistics-container">
          <h1 className="statistics-title">Personal Statistics</h1>
          <p className="statistics-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="statistics-page">
        <div className="statistics-container">
          <h1 className="statistics-title">Personal Statistics</h1>
          <p className="statistics-status">No statistics found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navbar />
        <div className="statistics-page">
        <div className="statistics-container">
            <div className="statistics-header">
            <h1 className="statistics-title">Personal Statistics</h1>
            <p className="statistics-subtitle">
                Track your performance and progress in Qurio
            </p>
            </div>

            <div className="statistics-user-card">
            <h2 className="statistics-username">{stats.username}</h2>
            <p className="statistics-rank">Global Rank: #{stats.rank}</p>
            </div>

            <div className="statistics-grid">
            <div className="stat-card">
                <h3 className="stat-label">Games Played</h3>
                <p className="stat-value">{stats.games_played}</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Daily Games</h3>
                <p className="stat-value">{stats.daily_games_played}</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Classic Games</h3>
                <p className="stat-value">{stats.classic_games_played}</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Questions Answered</h3>
                <p className="stat-value">{stats.questions_answered}</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Correct Answers</h3>
                <p className="stat-value">{stats.correct_answers}</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Accuracy</h3>
                <p className="stat-value">{stats.accuracy}%</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Average Score</h3>
                <p className="stat-value">{stats.average_score}</p>
            </div>

            <div className="stat-card">
                <h3 className="stat-label">Rank</h3>
                <p className="stat-value">#{stats.rank}</p>
            </div>
            </div>

            <div className="statistics-summary-card">
            <h3 className="summary-title">Summary</h3>
            <p className="summary-text">
                You have played <span className="summary-highlight">{stats.games_played}</span> total games
                and answered <span className="summary-highlight">{stats.questions_answered}</span> questions
                with an accuracy of <span className="summary-highlight">{stats.accuracy}%</span>.
            </p>
            </div>
        </div>
        </div>
      <Footer />
    </div>
    
  );
}