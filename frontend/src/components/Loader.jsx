import React from 'react';
import { Car } from 'lucide-react'; // npm i lucide-react (already in your project)

const FullScreenLoader = ({ message = 'Loading…' }) => {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner ring */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <div className="absolute inset-0 grid place-items-center">
            <Car className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">{message}</p>
          <p className="text-xs text-slate-500">Please wait</p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
