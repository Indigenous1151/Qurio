import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import "../details/Groups.css";
import { supabase } from '../supabaseClient/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

type Group = {
  group_id: string;
  group_name: string;
  description?: string;
  members: string[];
  invite_code: string;
};

type GroupInvite = {
  invite_id: string;
  group_id: string;
  status: string;
  groups: { group_name: string };
  invited_by: string;
  invited_by_user: { username: string };
};

export function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingInvites, setPendingInvites] = useState<GroupInvite[]>([]);
  // const [userId, setUserId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  // useEffect(() => {
  //   async function fetchUser() {
  //     const { data } = await supabase.auth.getUser();
  //     if (data?.user) setUserId(data.user.id);
  //   }
  //   fetchUser();
  // }, []);

  useEffect(() => {
    const init = async () => {
      await fetchUserGroups();
      await fetchPendingInvites();
    }

    init();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/my-groups`, {
        method: "GET",
        headers
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups);
      } else {
        setError("Failed to load groups.");
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups.");
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/pending-invites`, {
        method: "GET",
        headers
      });
      const data = await res.json();
      if (res.ok) setPendingInvites(data.pending_invites);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!joinCode.trim()) {
      setError("Please enter a group code.");
      return;
    }

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/join`, {
        method: "POST",
        headers,
        body: JSON.stringify({ invite_code: joinCode })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Successfully joined group!");
        setJoinCode("");
        fetchUserGroups();
      } else {
        setError(data.error || "Failed to join group.");
      }
    } catch (err) {
      setError("Failed to join group.");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!newGroupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          group_name: newGroupName,
          description: newGroupDescription
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Group "${newGroupName}" created successfully!`);
        setNewGroupName("");
        setNewGroupDescription("");
        setShowCreateForm(false);
        fetchUserGroups();
      } else {
        setError(data.error || "Failed to create group.");
      }
    } catch (err) {
      setError("Failed to create group.");
    }
  };

  const handleAcceptInvite = async (invite_id: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/accept-invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({ invite_id })
      });
      if (res.ok) {
        setMessage("Joined group successfully!");
        fetchUserGroups();
        fetchPendingInvites();
      } else {
        setError("Failed to accept invite.");
      }
    } catch (err) {
      setError("Failed to accept invite.");
    }
  };

  const handleDeclineInvite = async (invite_id: string) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/group/decline-invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({ invite_id })
      });
      if (res.ok) {
        setMessage("Invite declined.");
        fetchPendingInvites();
      } else {
        setError("Failed to decline invite.");
      }
    } catch (err) {
      setError("Failed to decline invite.");
    }
  };

  return (
    <div>
      <Navbar/>
      <div className="groups-page">
        <div className="groups-container">
          <div className="groups-header">
            <h1>Groups</h1>
            <p>Manage your groups and create new ones here.</p>
          </div>

          {message && <div className="groups-alert success">{message}</div>}
          {error && <div className="groups-alert error">{error}</div>}

          <div className="groups-grid">

            {/* My Groups */}
            <section className="groups-card">
              <div className="card-header-row">
                <h2>My Groups</h2>
              </div>
              {groups.length === 0 ? (
                <p className="empty-text">You have not joined any groups yet.</p>
              ) : (
                <div className="group-list">
                  {groups.map((group) => (
                    <div key={group.group_id} className="group-item">
                      <div>
                        <h3>{group.group_name}</h3>
                        <p>{group.description || "No description provided."}</p>
                        <span>{group.members.length} members</span>
                      </div>
                      <button
                        className="secondary-btn"
                        onClick={() => navigate(`/groups/${group.group_id}`)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pending Invitations */}
            <section className="groups-card">
              <h2>Pending Invitations</h2>
              {pendingInvites.length === 0 ? (
                <p className="empty-text">You have no pending invitations.</p>
              ) : (
                <div className="invite-list">
                  {pendingInvites.map((invite) => (
                    <div key={invite.invite_id} className="invite-item">
                      <div>
                        <h3>{invite.groups?.group_name}</h3>
                        <p>Invited by: {invite.invited_by_user?.username || "Unknown User"}</p>
                      </div>
                      <div className="invite-actions">
                        <button
                          className="primary-btn"
                          onClick={() => handleAcceptInvite(invite.invite_id)}
                        >
                          Accept
                        </button>
                        <button
                          className="secondary-btn"
                          onClick={() => handleDeclineInvite(invite.invite_id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Join Group */}
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

            {/* Create Group */}
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