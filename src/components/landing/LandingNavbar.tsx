import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/landing" className="flex items-center gap-2">
          <span className="text-2xl">🐙</span>
          <span className="font-fredoka font-bold text-xl text-[#6366F1]">
            AulaTeca
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#FFB830] text-[#1A1D2B] font-nunito font-bold text-sm hover:brightness-105 transition-all shadow-[0_4px_14px_rgba(255,184,48,0.4)] hover:shadow-[0_6px_20px_rgba(255,184,48,0.5)] hover:-translate-y-0.5 active:translate-y-0"
        >
          Começar Grátis
        </Link>
      </div>
    </nav>
  );
};

export default LandingNavbar;
