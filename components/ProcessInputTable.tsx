import React from 'react';
import { Process, SchedulingAlgorithmType } from '../types';

interface ProcessInputTableProps {
  processes: Process[];
  activeAlgorithm?: SchedulingAlgorithmType; 
}

const ProcessInputTable: React.FC<ProcessInputTableProps> = ({ processes, activeAlgorithm }) => {
  const isPriorityRelevant = 
    activeAlgorithm === SchedulingAlgorithmType.PRIORITY_NP || 
    activeAlgorithm === SchedulingAlgorithmType.PRIORITY_P ||
    activeAlgorithm === SchedulingAlgorithmType.MQS; 

  const containerStyle = "p-6 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/70 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] transition-shadow duration-300"; // Enhanced glow

  return (
    <div className={containerStyle}>
      <h2 className="text-xl font-semibold text-sky-400 mb-4 border-b border-slate-700 pb-3">Process Definitions</h2>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-max text-sm text-left text-slate-300">
          <thead className="text-xs text-sky-300 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-4 py-3">ID</th>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Arrival</th>
              <th scope="col" className="px-4 py-3">Burst</th>
              {isPriorityRelevant && <th scope="col" className="px-4 py-3">Priority</th>}
              <th scope="col" className="px-4 py-3">Color</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/80 transition-colors duration-150 ease-in-out">
                <td className="px-4 py-3 font-medium whitespace-nowrap">{p.id}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.arrivalTime}</td>
                <td className="px-4 py-3">{p.burstTime}</td>
                {isPriorityRelevant && <td className="px-4 py-3">{p.priority}</td>}
                <td className="px-4 py-3">
                  <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: p.color }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {processes.length === 0 && <p className="text-center text-slate-400 py-4">No processes defined.</p>}
    </div>
  );
};

export default ProcessInputTable;