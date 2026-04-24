import { useEffect, useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/ViewNotification.css';
import { supabase } from '../supabaseClient/supabaseClient';

type Notification = {
  notification_id: string;
  user_id: string;
  notification: string;
  created_at: string;
};

export function ViewNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function getAccessToken() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      console.error("No active session:", error);
      return null;
    }

    return data.session.access_token;
  }

  async function fetchNotifications() {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await getAccessToken();

      if (!token) {
        setErrorMessage("You must be logged in to view notifications.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:5001/notifications/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to load notifications.");
        setLoading(false);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setErrorMessage("Something went wrong while loading notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotification(id: string) {
    try {
      const token = await getAccessToken();

      if (!token) {
        setErrorMessage("You must be logged in to delete notifications.");
        return;
      }

      const response = await fetch(`http://127.0.0.1:5001/notifications/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to delete notification.");
        return;
      }

      setNotifications(prev =>
        prev.filter(n => n.notification_id !== id)
      );
    } catch (error) {
      console.error("Delete failed:", error);
      setErrorMessage("Something went wrong while deleting the notification.");
    }
  }

  return (
    <div>
      <Navbar />

      <h1 className="update-info-title"></h1>

      <div className="relative overflow-hidden">

        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            Your Notifications<br />
          </h1>
        </div>

        <div className="notification-container">
          <div className="notification-list-title"></div>

          {errorMessage && (
            <p className="no-notification-message">
              {errorMessage}
            </p>
          )}

          <div className="notification-list">
            {loading ? (
              <p className="no-notification-message">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="no-notification-message">
                You currently have no notifications.
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n.notification_id} className="notification-row">
                  <span className="notification-name">{n.notification}</span>

                  <button
                    className="button"
                    onClick={() => deleteNotification(n.notification_id)}
                  >
                    Delete Notification
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}