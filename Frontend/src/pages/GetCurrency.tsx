import { useState, useEffect } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/Footer';
import '../details/GetCurrency.css';
import { supabase } from '../supabaseClient/supabaseClient'
import { useNavigate } from "react-router-dom";


export function GetCurrency(){

    const navigate = useNavigate();
    const [currency, setCurrency] = useState<number>(0);

    useEffect(() => {
      const fetchCurrency = async () => {
        const { data: { user } } = await supabase.auth.getUser();
    
        if (!user) return;
    
        const { data: profile, error } = await supabase
          .from("public_profile")
          .select("currency")
          .eq("user_id", user.id)
          .maybeSingle();
    
        if (error) {
          console.error("Error fetching currency:", error);
          return;
        }
    
        setCurrency(profile?.currency ?? 0);
      };
    
      fetchCurrency();
    }, []);

    function paymentPage(packageData: { coins: number; price: number }) {
        navigate("/get-currency-payment", {
            state: packageData
        });
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
            Purchase in Game Currency! <br />
          </h1>
        </div>

        <div className="flex justify-center mb-6 sm:mb-8 -mt-6">
          <div className="inline-flex items-center gap-3 bg-[#eef4f0] border border-[#d8e2db] rounded-lg px-5 py-3 shadow-sm">
            <span className="text-2xl">💰</span>
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-widest text-[#888]">
                Currency
              </div>
              <div className="text-[#638F77] font-extrabold text-lg sm:text-xl">
                {currency}
              </div>
            </div>
          </div>
        </div>
          
      <div className = "enter-info-box">
                Purchase in game currency to use for buying hints and other items in the game!

        <div className="enter-info-small-box">
            <span className="pkg-title">Package 1</span>
            <span className="pkg-price">150 coins for $2.99</span>
            <button className="update-button" onClick={() => paymentPage({ coins: 150, price: 2.99 })}>
              Buy Now!
            </button>
        </div>

        <div className="enter-info-small-box">
            <span className="pkg-title">Package 2</span>
            <span className="pkg-price">50 coins for $1.00</span>
            <button className="update-button" onClick={() =>paymentPage({ coins: 50, price: 1.00 })}>
              Buy Now!
            </button>
        </div>

      </div>

      <Footer/>
    </div>
    </div>
  )
}

