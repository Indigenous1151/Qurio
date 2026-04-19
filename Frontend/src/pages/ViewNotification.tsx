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

  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get logged-in user
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      } else {
        console.error("No user found:", error);
      }
    }

    fetchUser();
  }, []);

  // Fetch notifications from table
  useEffect(() => {
    if (!userId) return;

    async function fetchNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data || []);
    }

    fetchNotifications();
  }, [userId]);

// deleting the notification from the table
async function deleteNotification(id: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("notification_id", id);

  if (error) {
    console.error("Delete failed:", error);
    return;
  }

  setNotifications(prev =>
    prev.filter(n => n.notification_id !== id)
  );
}


  return(
  <div>
    <Navbar/>
      <h1 className = "update-info-title"></h1>
      <div className="relative overflow-hidden">
             
        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}>
            Your Notifications<br />
          </h1>
          </div>


      <div className = "notification-container">
        <div className="notification-list-title">
        </div>        
        <div className="notification-list">
        {notifications.length === 0 ? (
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
        

      <Footer/>
    </div>
    </div>
  )
}