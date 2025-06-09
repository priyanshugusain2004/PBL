import React from 'react';
import { SchedulingAlgorithmType } from '../types';
import { ALGORITHM_OPTIONS, DEFAULT_TIME_QUANTUM } from '../constants';

interface ControlsPanelProps {
  selectedAlgorithm: SchedulingAlgorithmType;
  onAlgorithmChange: (algorithm: SchedulingAlgorithmType) => void;
  timeQuantum: number;
  onTimeQuantumChange: (quantum: number) => void;
  onStartSimulation: () => void; // This is effectively "Apply & Re-run with current processes"
  onResetSimulation: () => void; // This is "Reset All & Change Configuration"
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  currentStep: number;
  totalSteps: number;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  isSimulationDone: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  timeQuantum,
  onTimeQuantumChange,
  onStartSimulation, 
  onResetSimulation, 
  isPlaying,
  onTogglePlay,
  onNextStep,
  onPrevStep,
  currentStep,
  totalSteps,
  simulationSpeed,
  onSpeedChange,
  isSimulationDone
}) => {
  const showTimeQuantumInput = 
    selectedAlgorithm === SchedulingAlgorithmType.RR ||
    selectedAlgorithm === SchedulingAlgorithmType.MQS;

  const buttonBaseStyle = "px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md";
  const primaryButtonStyle = `${buttonBaseStyle} bg-sky-600 hover:bg-sky-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-sky-500 hover:shadow-[0_0_15px_-3px_theme(colors.sky.600)]`;
  const dangerButtonStyle = `${buttonBaseStyle} bg-rose-600 hover:bg-rose-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-rose-500 hover:shadow-[0_0_15px_-3px_theme(colors.rose.600)]`;
  const secondaryButtonStyle = `${buttonBaseStyle} bg-slate-600 hover:bg-slate-500 text-slate-100 hover:shadow-md hover:scale-105 active:scale-95 focus:ring-slate-500 hover:shadow-[0_0_15px_-3px_theme(colors.slate.600)]`;
  
  const inputBaseStyle = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-colors duration-200 ease-in-out hover:border-slate-500 disabled:opacity-70 disabled:hover:border-slate-600";
  const panelContainerStyle = "p-6 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/70 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] transition-shadow duration-300 space-y-6"; // Enhanced glow


  let displayPercentage = 0;
  if (totalSteps > 0) {
    if (currentStep >= totalSteps - 1) { 
      displayPercentage = 100;
    } else if (totalSteps > 1) { 
      displayPercentage = Math.round((currentStep / (totalSteps - 1)) * 100);
    }
  }


  return (
    <div className={panelContainerStyle}>
      <h2 className="text-2xl font-semibold text-sky-400 mb-4 border-b border-slate-700 pb-3">Simulation Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="algorithm-select" className="block text-sm font-medium text-slate-300 mb-1">
            Scheduling Algorithm
          </label>
          <select
            id="algorithm-select"
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as SchedulingAlgorithmType)}
            className={inputBaseStyle}
          >
            {ALGORITHM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {showTimeQuantumInput && (
          <div>
            <label htmlFor="time-quantum" className="block text-sm font-medium text-slate-300 mb-1">
              Time Quantum (for {selectedAlgorithm})
            </label>
            <input
              type="number"
              id="time-quantum"
              value={timeQuantum}
              onChange={(e) => onTimeQuantumChange(Math.max(1, parseInt(e.target.value, 10) || DEFAULT_TIME_QUANTUM))}
              min="1"
              className={inputBaseStyle}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between pt-2">
        <button
          onClick={onStartSimulation}
          className={`${primaryButtonStyle} flex-grow md:flex-grow-0`}
        >
          Apply & Run Simulation
        </button>
        <button
          onClick={onResetSimulation}
          className={`${dangerButtonStyle} flex-grow md:flex-grow-0`}
        >
          Reset & Change Config
        </button>
      </div>
      
      {isSimulationDone && totalSteps > 0 && (
        <div className="pt-4 border-t border-slate-700 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={onPrevStep} disabled={currentStep === 0 || isPlaying} className={`${secondaryButtonStyle} px-4 py-2 flex-grow md:flex-grow-0`}>Prev</button>
            <button onClick={onTogglePlay} className={`${buttonBaseStyle} px-4 py-2 font-semibold flex-grow md:flex-grow-0 ${isPlaying ? 'bg-amber-500 hover:bg-amber-400 focus:ring-amber-400 hover:shadow-[0_0_15px_-3px_theme(colors.amber.500)]' : 'bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-400 hover:shadow-[0_0_15px_-3px_theme(colors.emerald.500)]'}`}>
              {isPlaying ? 'Pause' : (currentStep >= totalSteps -1 ? 'Replay' : 'Play')} ({displayPercentage}%)
            </button>
            <button onClick={onNextStep} disabled={currentStep >= totalSteps -1 || isPlaying} className={`${secondaryButtonStyle} px-4 py-2 flex-grow md:flex-grow-0`}>Next</button>
          </div>
          <div>
            <label htmlFor="speed-control" className="block text-sm font-medium text-slate-300 mb-1">
              Animation Speed: {simulationSpeed}x
            </label>
            <input
              type="range"
              id="speed-control"
              min="0.5"
              max="5"
              step="0.1"
              value={simulationSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-colors duration-200 ease-in-out"
            />
          </div>
        </div>
      )}
       { !isSimulationDone && totalSteps === 0 && (
            <p className="text-sm text-slate-400 text-center pt-2">Configure algorithm and click "Apply & Run Simulation".</p>
        )}
    </div>
  );
};

export default ControlsPanel;