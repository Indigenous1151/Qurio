import { Link } from 'react-router-dom';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

export function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate('/');
        return;
      }

      const res = await fetch(`${API_URL}/payment/admin/is-admin`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      const json = await res.json();
      if (!json.is_admin) {
        navigate('/');
      }
    }

    checkAdmin();
  }, [navigate]);

  return (
    <div>
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-64 md:w-96 h-64 md:h-96 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 md:w-72 h-48 md:h-72 rounded-full bg-[#638F77] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center relative z-10">
          <div className="inline-block bg-[#638F77] text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            Admin Dashboard
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}
          >
            Welcome back, <br />
            <span className="text-[#638F77]">Admin</span>
          </h1>

          <p className="text-[#555] text-base sm:text-lg max-w-md mx-auto mb-10 sm:mb-12">
            Manage payment methods and platform settings.
          </p>

          <div className="mt-8">
            <Link to="/admin/payment">
              <button className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-all cursor-pointer border-none">
                ⚙️ Configure Payment Methods
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
