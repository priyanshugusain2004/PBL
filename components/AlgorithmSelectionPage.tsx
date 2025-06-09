import React from 'react';
import { SchedulingAlgorithmType } from '../types';
import { ALGORITHM_OPTIONS } from '../constants';

interface AlgorithmSelectionPageProps {
  onAlgorithmSelect: (algorithm: SchedulingAlgorithmType) => void;
}

const AlgorithmSelectionPage: React.FC<AlgorithmSelectionPageProps> = ({ onAlgorithmSelect }) => {
  const cardBaseStyle = "p-6 bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer hover:bg-slate-700/70 ring-1 ring-slate-700 hover:ring-sky-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 transform hover:scale-[1.03] hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)]"; // Enhanced glow

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <header className="text-center mb-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto mb-4 text-sky-400">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
          <path d="M8.25 9.75A.75.75 0 0 1 9 9h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" />
        </svg>
        <h1 className="text-4xl sm:text-5xl font-bold text-sky-400 tracking-tight">CPU Scheduling Visualizer</h1>
        <p className="text-slate-400 text-lg mt-2">Step 1: Choose a Scheduling Algorithm</p>
      </header>

      <main className="w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALGORITHM_OPTIONS.map((algo) => (
            <div
              key={algo.value}
              className={cardBaseStyle}
              onClick={() => onAlgorithmSelect(algo.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAlgorithmSelect(algo.value)}
              tabIndex={0}
              role="button"
              aria-label={`Select ${algo.label}`}
            >
              <h2 className="text-xl font-semibold text-sky-300 mb-1">{algo.label.split('(')[0].trim()}</h2>
              <p className="text-sm text-slate-400 mb-2">{`(${algo.label.split('(')[1]}`}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{algo.description}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="mt-12 text-center">
        <p className="text-sm text-slate-500">Select an algorithm to proceed to process configuration.</p>
      </footer>
    </div>
  );
};

export default AlgorithmSelectionPage;