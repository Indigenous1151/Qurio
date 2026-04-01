import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../details/Groups.css";

type Member = {
  id: string;
  username: string;
};

export function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([
    { id: "1", username: "ashley" },
    { id: "2", username: "user4432" },
    { id: "3", username: "user0384" },
  ]);

  const [inviteUsername, setInviteUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const group = useMemo(() => {
    // TODO: Replace with backend fetch using groupId
    return {
      id: groupId ?? "",
      name: "Sample Group",
      description: "This is where your group details will appear.",
    };
  }, [groupId]);

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!inviteUsername.trim()) {
      setError("Please enter a username to invite.");
      return;
    }

    // TODO: Replace with backend call

    setMessage(`Invitation sent to "${inviteUsername}".`);
    setInviteUsername("");
  };

  const handleLeaveGroup = () => {
    setMessage("");
    setError("");

    // TODO: Replace with backend call

    navigate("/groups");
  };

  return (
    <div className="groups-page">
      <div className="groups-container">
        <div className="groups-header">
          <button className="back-btn" onClick={() => navigate("/groups")}>
            ← Back to Groups
          </button>
          <h1>{group.name}</h1>
          <p>{group.description}</p>
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
                  <div key={member.id} className="member-item">
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