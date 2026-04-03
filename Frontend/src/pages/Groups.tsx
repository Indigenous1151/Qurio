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

export function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
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

  // get logged in user
  useEffect(() => {
    async function fetchUser() {
        const { data } = await supabase.auth.getUser();
        if (data?.user) setUserId(data.user.id);
    }
    fetchUser();
}, []);

  // fetch user groups on load
  useEffect(() => {
    if (!userId) return;
    fetchUserGroups();
  }, [userId]);

  const fetchUserGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/group/my-groups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId as string
        }
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

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!joinCode.trim()) {
      setError("Please enter a group code.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/group/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId as string
        },
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
      const res = await fetch(`${API_URL}/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId as string
        },
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
        fetchUserGroups(); // refresh list from backend
    } else {
        setError(data.error || "Failed to create group.");
      }
    } catch (err) {
      setError("Failed to create group.");
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