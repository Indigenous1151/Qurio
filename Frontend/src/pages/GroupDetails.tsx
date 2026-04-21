import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../details/Groups.css";
import { supabase } from '../supabaseClient/supabaseClient';
import type { Game } from "../types/Game";

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

type GameCardProps = {
  game: Game;
  type: "active" | "upcoming";
};

const GameCard = ({ game, type }: GameCardProps) => {
  return (
    <div className="game-item">
      <div className="game-info">
        <p className="game-title">
          Questions: {game.game_params?.question_count ?? "N/A"}
        </p>

        {game.game_params?.category && (
          <p className="game-detail">
            Category: {game.game_params.category}
          </p>
        )}

        {game.game_params?.difficulty && (
          <p className="game-detail">
            Difficulty: {game.game_params.difficulty}
          </p>
        )}

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
};

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

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
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
    if (!groupId) return;
    const fetchGames = async () => {
      try {
        const headers = await getAuthHeader();
        const res = await fetch(`${API_URL}/group/games?group_id=${groupId}`, {
          headers
        });
        console.log("Fetch games response: ", res);
        console.log("Fetch games content type: ", res.headers.get("Content-Type"));
        const data = await res.json()

        setGames({
          active: data.active,
          upcoming: data.upcoming,
          finished: data.finished
        });
      } catch (err) {
        console.error("Error fetching games: ", err);
      }
    };

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
    </div>
  );
}