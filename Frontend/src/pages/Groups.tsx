import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import "../details/Groups.css";

type Group = {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
};

type GroupInvite = {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
};

export function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "testgroup1",
      description: "Trivia group description here.",
      memberCount: 5,
    },
    {
      id: "2",
      name: "trivia group!",
      description: "group description",
      memberCount: 4,
    },
  ]);

  const [pendingInvites, setPendingInvites] = useState<GroupInvite[]>([
    {
      id: "101",
      groupId: "3",
      groupName: "Trivia",
      invitedBy: "ashley",
    },
    {
      id: "102",
      groupId: "4",
      groupName: "General Knowledge ",
      invitedBy: "users8392808",
    },
  ]);

  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!joinCode.trim()) {
      setError("Please enter a group code.");
      return;
    }

    // TODO: Replace with backend call
    // Example:
    // await fetch("/api/groups/join", { method: "POST", body: JSON.stringify({ code: joinCode }) })

    setMessage(`Successfully requested to join group with code "${joinCode}".`);
    setJoinCode("");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!newGroupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    const createdGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      memberCount: 1,
    };

    // TODO: Replace with backend call

    setGroups((prev) => [createdGroup, ...prev]);
    setMessage(`Group "${newGroupName}" created successfully.`);
    setNewGroupName("");
    setNewGroupDescription("");
    setShowCreateForm(false);
  };

  const handleAcceptInvite = (invite: GroupInvite) => {
    clearFeedback();

    const joinedGroup: Group = {
      id: invite.groupId,
      name: invite.groupName,
      description: "Joined from invitation.",
      memberCount: 1,
    };

    // TODO: Replace with backend call

    setGroups((prev) => [joinedGroup, ...prev]);
    setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
    setMessage(`You joined "${invite.groupName}".`);
  };

  const handleDeclineInvite = (inviteId: string) => {
    clearFeedback();

    // TODO: Replace with backend call

    setPendingInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    setMessage("Invitation declined.");
  };

  return (
    <div>
      <Navbar/>
      <div className="groups-page">
        <div className="groups-container">
          <div className="groups-header">
            <h1>Groups</h1>
            <p>Manage your groups, invitations, and create new ones here.</p>
          </div>

          {message && <div className="groups-alert success">{message}</div>}
          {error && <div className="groups-alert error">{error}</div>}

          <div className="groups-grid">
            <section className="groups-card">
              <div className="card-header-row">
                <h2>My Groups</h2>
              </div>

              {groups.length === 0 ? (
                <p className="empty-text">You have not joined any groups yet.</p>
              ) : (
                <div className="group-list">
                  {groups.map((group) => (
                    <div key={group.id} className="group-item">
                      <div>
                        <h3>{group.name}</h3>
                        <p>{group.description || "No description provided."}</p>
                        <span>{group.memberCount} members</span>
                      </div>
                      <button
                        className="secondary-btn"
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="groups-card">
              <h2>Pending Invitations</h2>

              {pendingInvites.length === 0 ? (
                <p className="empty-text">You have no pending invitations.</p>
              ) : (
                <div className="invite-list">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="invite-item">
                      <div>
                        <h3>{invite.groupName}</h3>
                        <p>Invited by: {invite.invitedBy}</p>
                      </div>
                      <div className="invite-actions">
                        <button
                          className="primary-btn"
                          onClick={() => handleAcceptInvite(invite)}
                        >
                          Accept
                        </button>
                        <button
                          className="secondary-btn"
                          onClick={() => handleDeclineInvite(invite.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="groups-card">
              <h2>Join a Group</h2>
              <form onSubmit={handleJoinByCode} className="group-form">
                <label htmlFor="joinCode">Enter Group Code</label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter code here"
                />
                <button type="submit" className="primary-btn">
                  Join Group
                </button>
              </form>
            </section>

            <section className="groups-card">
              <div className="card-header-row">
                <h2>Create a Group</h2>
                {!showCreateForm && (
                  <button
                    className="primary-btn"
                    onClick={() => {
                      clearFeedback();
                      setShowCreateForm(true);
                    }}
                  >
                    Create Group
                  </button>
                )}
              </div>

              {showCreateForm ? (
                <form onSubmit={handleCreateGroup} className="group-form">
                  <label htmlFor="groupName">Group Name</label>
                  <input
                    id="groupName"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter a group name"
                  />

                  <label htmlFor="groupDescription">Description</label>
                  <textarea
                    id="groupDescription"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter an optional description"
                    rows={4}
                  />

                  <div className="form-actions">
                    <button type="submit" className="primary-btn">
                      Save Group
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewGroupName("");
                        setNewGroupDescription("");
                        clearFeedback();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="empty-text">
                  Start a new group and invite friends to play together.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
