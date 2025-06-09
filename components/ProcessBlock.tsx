import React from 'react';
import { Process } from '../types';

interface ProcessBlockProps {
  process: Process;
  isActive?: boolean;
}

const ProcessBlock: React.FC<ProcessBlockProps> = ({ process, isActive = false }) => {
  return (
    <div
      className={`p-3 m-1 rounded-lg shadow-md text-sm transition-all duration-200 ease-in-out transform hover:scale-105 
                  ${isActive 
                    ? 'ring-4 ring-offset-2 ring-offset-slate-700 ring-white shadow-xl shadow-white/40' // Enhanced active glow
                    : 'hover:shadow-xl hover:shadow-sky-400/40 hover:ring-2 hover:ring-sky-300/70'}`} // Enhanced hover glow
      style={{ 
        backgroundColor: process.color,
        color: '#FFFFFF' 
      }}
      title={`ID: ${process.id}\nArrival: ${process.arrivalTime}\nBurst: ${process.burstTime}\nPriority: ${process.priority}\nRemaining: ${process.remainingBurstTime}`}
    >
      <div className="font-semibold truncate">{process.name}</div>
      <div className="text-xs">BT: {process.burstTime} / Rem: {process.remainingBurstTime}</div>
      {isActive && <div className="text-xs font-bold mt-1 animate-pulse">RUNNING</div>}
    </div>
  );
};

export default ProcessBlock;