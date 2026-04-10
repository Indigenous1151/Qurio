import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../details/Groups.css";
import { supabase } from '../supabaseClient/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

type Member = {
  user_id: string;
  username: string;
};

export function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
  };

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    }
    fetchUser();
  }, []);

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

          <section className="groups-card danger-card">
            <h2>Leave Group</h2>
            <p className="empty-text">
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