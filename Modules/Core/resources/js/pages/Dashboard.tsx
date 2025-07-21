import React from 'react';
import WelcomeHero from '../components/dashboard/WelcomeHero';
import QuickStats from '../components/dashboard/QuickStats';
import DualClockWidget from '../components/dashboard/DualClockWidget';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] py-12">
      <WelcomeHero />
      <QuickStats />
      <div className="w-full flex justify-center mt-8">
        <div className="max-w-xs w-full">
          <DualClockWidget />
        </div>
      </div>
      {/* Add more modular widgets below (Current Assignment, Timesheet, Activity Feed, etc.) */}
    </div>
  );
}
