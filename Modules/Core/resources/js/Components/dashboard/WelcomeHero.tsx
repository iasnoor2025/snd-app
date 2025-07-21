import React from 'react';

export const WelcomeHero: React.FC = () => (
  <div className="backdrop-blur-lg bg-white/10 border border-white/30 rounded-3xl shadow-2xl p-12 max-w-2xl w-full flex flex-col items-center relative" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-2xl opacity-60" />
    <div className="mb-4 scale-125">
      <span className="inline-block w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">SND</span>
    </div>
    <h1 className="text-5xl font-extrabold text-center text-white drop-shadow-lg mb-4 tracking-tight" style={{ letterSpacing: '0.02em' }}>
      Welcome to SND Rental Management
    </h1>
    <p className="text-lg text-center text-white/80 mb-8 max-w-xl">
      Your all-in-one platform for equipment, projects, employees, and more. Experience the future of rental management.
    </p>
    <div className="flex flex-wrap gap-4 justify-center mt-2">
      <a href="#" className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-bold shadow hover:bg-cyan-600 transition">Create Timesheet</a>
      <a href="#" className="px-6 py-2 rounded-lg border border-white/30 text-white font-bold shadow hover:bg-white/10 transition">Add Assignment</a>
      <a href="#" className="px-6 py-2 rounded-lg border border-white/30 text-white font-bold shadow hover:bg-white/10 transition">Request Leave</a>
    </div>
  </div>
);

export default WelcomeHero;
