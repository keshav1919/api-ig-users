import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Settings, Terminal, Shield } from 'lucide-react';

export const CustomScriptView = ({ html }) => {
  if (!html || !html.trim()) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400 shadow-xl shadow-blue-500/10">
          <Code className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Custom Web Script Mode Active</h1>
        <p className="text-xs text-gray-400 max-w-md mb-6 leading-relaxed">
          No custom HTML or script has been pasted yet. Navigate to your Admin Console to enter or paste your custom website code.
        </p>
        <Link
          to="/admin"
          className="px-6 py-3 bg-gradient-to-r from-[#0064E0] to-[#0095F6] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Open Admin Panel</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Full-bleed isolated script sandbox */}
      <iframe
        title="Custom Website View"
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        className="w-full h-screen border-0 block"
      />

      {/* Discreet floating admin switch shortcut */}
      <div className="fixed bottom-3 right-3 z-50 opacity-20 hover:opacity-100 transition-opacity">
        <Link
          to="/admin"
          title="Admin Console"
          className="w-8 h-8 bg-gray-900/90 border border-gray-700/80 rounded-full flex items-center justify-center text-gray-400 hover:text-white shadow-lg transition-all"
        >
          <Shield className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default CustomScriptView;
