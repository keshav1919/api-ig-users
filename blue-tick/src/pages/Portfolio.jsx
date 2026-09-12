import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const Portfolio = () => {
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#111] text-white p-6 font-sans relative select-none">
      <div className="text-center max-w-[500px] flex flex-col items-center">
        <h1 className="text-4xl sm:text-[50px] font-bold mb-2.5 leading-tight tracking-tight">
          Hi, I'm <span className="text-[#00d084]">legend</span> 👋
        </h1>

        <h2 className="text-lg sm:text-[22px] text-[#ccc] font-normal mb-5">
          backend Developer
        </h2>

        <p className="text-sm sm:text-base text-[#aaa] leading-relaxed mb-6 font-normal">
          I build clean, responsive and modern websites using HTML, CSS, Tailwind CSS , node.js, python, React.
        </p>

        <a
          href="https://t.me/LEGEND_TG"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-[#00d084] hover:bg-[#00ba76] active:scale-95 text-[#111] font-bold text-sm sm:text-base rounded-md transition-all shadow-sm"
        >
          Contact Me
        </a>
      </div>

      {/* Discreet Staff Console Link */}
      <div className="absolute bottom-4 right-4 opacity-20 hover:opacity-80 transition-opacity">
        <Link to="/admin" title="Staff Portal" className="text-[#666] hover:text-[#aaa] p-1 block">
          <Lock className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default Portfolio;
