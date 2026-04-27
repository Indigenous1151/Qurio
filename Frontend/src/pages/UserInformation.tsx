
import { useState,useEffect } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/UpdateInformation.css';
import { supabase } from '../supabaseClient/supabaseClient'

export function UserInformation(){
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [currency, setCurrency] = useState<number>(0);
  const [bio, setBio] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [displayname, setDisplayName] = useState<string | null>(null);


  useEffect(() => {
  async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) 
        return;

    setUserId(user.id);
    setEmail(user.email || "No email"); 
    setDisplayName(user.user_metadata.display_name || "No Display Name");

  const { data: profile, error } = await supabase
  .from("public_profile")
  .select("username, currency, bio")
  .eq("user_id", user.id)
  .maybeSingle();

if (error) {
  console.error("Error fetching profile:", error);
} 

if (!profile) {
  setUsername("Guest");
  setCurrency(0);
  setBio("None")
} else {
  setUsername(profile.username);
  setCurrency(profile.currency ?? 0);
  setBio(profile.bio);
}
  }

  fetchUserData();
}, []);
  return (
    <div>
      <Navbar />

      <div className="relative overflow-hidden">
       
        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">

        
         
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            User Information<br></br>
          </h1>

          <p className="bg-[#638F77]/10 text-[#555] text-base sm:text-lg max-w-md mx-auto mb-10 sm:mb-12 px-4 py-3 rounded-xl">
           To change any of your information look at<br></br> 'Personal Info' or 'Public Info' page
          </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto text-left">

                <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="text-lg font-semibold text-[#1a1a1a]">
                    {username || "Not set"}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-[#1a1a1a]">
                    {email}
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="text-lg font-semibold text-[#638F77]">
                    {displayname}
                    </p>
                </div>
                
                <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Currency</p>
                    <p className="text-lg font-semibold text-[#638F77]">
                    {currency}
                    </p>
                </div>
                
                <div className="sm:col-span-2 bg-white shadow-md rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-base text-gray-700 leading-relaxed">
                    {bio || "No bio added yet."}
                    </p>
                </div>



                </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}