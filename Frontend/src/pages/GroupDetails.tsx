import { useEffect, useState } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../details/Groups.css";
import { supabase } from '../supabaseClient/supabaseClient';
import type { Game } from "../types/Game";
import { getCategoryLabel, getDifficultyLabel } from "../utils/gameFormat";

const API_URL = import.meta.env.VITE_API_URL;

type Member = {
  user_id: string;
  username: string;
};

type GameState = {
  active: Game[];
  upcoming: Game[];
  finished: Game[];
};

type CreateGameForm = {
  question_count: string;
  duration_hours: string;
  start_at: string;
  category: string;
  difficulty: string;
};

type GameCardProps = {
  game: Game;
  type: "active" | "upcoming";
};

const GameCard = React.memo(({ game, type }: GameCardProps) => {
  return (
    <div className="game-item">
      <div className="game-info">
        <p className="game-title">
          Questions: {game.game_params?.question_count ?? "N/A"}
        </p>

        <p className="game-detail">
          Category: {getCategoryLabel(game.game_params?.category)}
        </p>

        <p className="game-detail">
          Difficulty: {getDifficultyLabel(game.game_params?.difficulty)}
        </p>

        {type === "active" && (
          <p className="game-detail">
            Ends: {new Date(game.end_at).toLocaleString()}
          </p>
        )}

        {type === "upcoming" && (
          <>
            <p className="game-detail">
              Starts: {new Date(game.start_at).toLocaleString()}
            </p>
            <p className="game-detail">
              Ends: {new Date(game.end_at).toLocaleString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
});

export function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  // const [userId, setUserId] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [games, setGames] = useState<GameState>({
    active: [],
    upcoming: [],
    finished: []
  });
  const [showCreateGameModal, setShowCreateGameModal] = useState(false);
  const [createGameForm, setCreateGameForm] = useState<CreateGameForm>({
    question_count: "10",
    duration_hours: "1",
    start_at: "",
    category: "",
    difficulty: ""
  });
  const [creatingGame, setCreatingGame] = useState(false);

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
  };

  const fetchGames = async () => {
    if (!groupId) return;

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/games?group_id=${groupId}`, {
        headers
      });

      const data = await res.json();

      setGames({
        active: data.active,
        upcoming: data.upcoming,
        finished: data.finished
      });
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  };

  useEffect(() => {
    if (!groupId) return;
    async function fetchGroup() {
      try {
        const res = await fetch(`${API_URL}/group/${groupId}`);
        const data = await res.json();
        if (res.ok) {
          setGroup(data.group);
          // fetch usernames for members
          const { data: profiles } = await supabase
            .from("public_profile")
            .select("user_id, username")
            .in("user_id", data.group.members);
          setMembers(profiles || []);
        }
      } catch (err) {
        console.error("Error fetching group:", err);
      }
    }
    fetchGroup();
  }, [groupId]);

  // get active and upcoming games, then determine the number of each
  useEffect(() => {
    fetchGames();
  }, [groupId]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!inviteUsername.trim()) {
      setError("Please enter a username to invite.");
      return;
    }

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          group_id: groupId,
          username: inviteUsername
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Invitation sent to "${inviteUsername}".`);
        setInviteUsername("");
      } else {
        setError(data.error || "Failed to send invite.");
      }
    } catch (err) {
      setError("Failed to send invite.");
    }
  };

  const handleLeaveGroup = async () => {
    setMessage("");
    setError("");

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/leave`, {
        method: "POST",
        headers,
        body: JSON.stringify({ group_id: groupId })
      });

      if (res.ok) {
        navigate("/groups");
      } else {
        setError("Failed to leave group.");
      }
    } catch (err) {
      setError("Failed to leave group.");
    }
  };

  const handleCreateGameFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateGameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!createGameForm.question_count || !createGameForm.duration_hours || !createGameForm.start_at) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setCreatingGame(true);
      const headers = await getAuthHeader();
      // Convert datetime-local to ISO 8601 string with UTC timezone
      const startDateTime = new Date(createGameForm.start_at).toISOString();
      
      const res = await fetch(`${API_URL}/group/create-game`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          group_id: groupId,
          start_at: startDateTime,
          duration_hours: parseInt(createGameForm.duration_hours),
          question_count: parseInt(createGameForm.question_count),
          category: createGameForm.category || null,
          difficulty: createGameForm.difficulty || null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Game created successfully!");
        setShowCreateGameModal(false);
        setCreateGameForm({
          question_count: "10",
          duration_hours: "1",
          start_at: "",
          category: "",
          difficulty: ""
        });

        await fetchGames();
      } else {
        setError(data.error || "Failed to create game.");
      }
    } catch (err) {
      setError("Failed to create game.");
      console.error(err);
    } finally {
      setCreatingGame(false);
    }
  };

  

  return (
    <div className="groups-page">
      <div className="groups-container">
        <div className="groups-header">
          <button className="back-btn" onClick={() => navigate("/groups")}>
            ← Back to Groups
          </button>
          <h1>{group?.group_name || "Loading..."}</h1>
          <p>{group?.description || ""}</p>
          {group?.invite_code && (
            <p>Invite Code: <strong>{group.invite_code}</strong></p>
          )}
        </div>

        {message && <div className="groups-alert success">{message}</div>}
        {error && <div className="groups-alert error">{error}</div>}

        <div className="groups-grid single-column">
          {/* Members */}
          <section className="groups-card">
            <h2>Members</h2>
            {members.length === 0 ? (
              <p className="empty-text">No members found.</p>
            ) : (
              <div className="member-list">
                {members.map((member) => (
                  <div key={member.user_id} className="member-item">
                    {member.username}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Group Games */}
          <section className="groups-card">
          <h2>Group Games</h2>

          {/* Create Game Button */}
          <button className="primary-btn" onClick={() => setShowCreateGameModal(true)}>
            Create New Game
          </button>

          {/* No games message */}
          {games.active.length === 0 && games.upcoming.length === 0 && (
            <p>No games available</p>
          )}

          {/* Active Games */}
          {games.active.length > 0 && (
            <div className="games-subsection">
              <h3>Active Games</h3>
              <div className="games-list">
                {games.active.map((game) => (
                  <GameCard key={game.game_id} game={game} type="active" />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Games */}
          {games.upcoming.length > 0 && (
            <div className="games-subsection">
              <h3>Upcoming Games</h3>
              <div className="games-list">
                {games.upcoming.map((game) => (
                  <GameCard key={game.game_id} game={game} type="upcoming" />
                ))}
              </div>
            </div>
          )}
        </section>

          {/* Invite User */}
          <section className="groups-card">
            <h2>Invite User to Group</h2>
            <form onSubmit={handleInviteUser} className="group-form">
              <label htmlFor="inviteUsername">Username</label>
              <input
                id="inviteUsername"
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Enter username"
              />
              <button type="submit" className="primary-btn">
                Send Invite
              </button>
            </form>
          </section>

          {/* Leave Group */}
          <section className="groups-card danger-card">
            <h2>Leave Group</h2>
            <p style={{ paddingBottom: "10px" }} className="empty-text">
              Leave this group if you no longer want to participate.
            </p>
            <button className="danger-btn" onClick={handleLeaveGroup}>
              Leave Group
            </button>
          </section>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateGameModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Group Game</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateGameModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="create-game-form">
              <div className="form-group">
                <label htmlFor="question_count">Number of Questions *</label>
                <input
                  id="question_count"
                  type="number"
                  name="question_count"
                  min="1"
                  max="50"
                  value={createGameForm.question_count}
                  onChange={handleCreateGameFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration_hours">Duration (hours) *</label>
                <input
                  id="duration_hours"
                  type="number"
                  name="duration_hours"
                  min="1"
                  max="24"
                  step="1"
                  value={createGameForm.duration_hours}
                  onChange={handleCreateGameFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="start_at">Start Date & Time *</label>
                <input
                  id="start_at"
                  type="datetime-local"
                  name="start_at"
                  value={createGameForm.start_at}
                  onChange={handleCreateGameFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category (optional)</label>
                <select
                  id="category"
                  name="category"
                  value={createGameForm.category}
                  onChange={handleCreateGameFormChange}
                >
                  <option value="">-- Select a category --</option>
                  <option value="9">General Knowledge</option>
                  <option value="10">Books</option>
                  <option value="11">Film</option>
                  <option value="12">Music</option>
                  <option value="14">Television</option>
                  <option value="15">Video Games</option>
                  <option value="17">Science & Nature</option>
                  <option value="18">Computers</option>
                  <option value="19">Mathematics</option>
                  <option value="20">Mythology</option>
                  <option value="21">Sports</option>
                  <option value="22">Geography</option>
                  <option value="23">History</option>
                  <option value="24">Politics</option>
                  <option value="25">Art</option>
                  <option value="27">Animals</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty (optional)</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={createGameForm.difficulty}
                  onChange={handleCreateGameFormChange}
                >
                  <option value="">-- Select difficulty --</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowCreateGameModal(false)}
                  disabled={creatingGame}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={creatingGame}
                >
                  {creatingGame ? "Creating..." : "Create Game"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}