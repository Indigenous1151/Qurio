
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient/supabaseClient";
import '../details/Logout.css';

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("http://127.0.0.1:5000/auth/signout", {
          method: "POST",
          credentials: "include",
        });

        //Logging out of Supabase 
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        navigate("/sign-in");
      }
    };

    logout();
  }, [navigate]);

  return ( 
  <div className="relative flex items-center justify-center min-h-screen">
    <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
    <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
    <div className = "smallbox">
        Logging you out of Qurio
        <br></br>
        <br></br>
        Please wait a moment...
    </div>

  </div>
  );
}