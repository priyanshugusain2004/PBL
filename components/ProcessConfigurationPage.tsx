import React, { useState, useEffect } from 'react';
import { Process, UserProcessInput, SchedulingAlgorithmType, PROCESS_COLORS } from '../types';
import { getInitialDefaultProcesses, DEFAULT_TIME_QUANTUM, MIN_PROCESSES_FOR_SIMULATION, ALGORITHM_OPTIONS } from '../constants';

interface ProcessConfigurationPageProps {
  selectedAlgorithm: SchedulingAlgorithmType;
  onProcessesConfigured: (processes: Process[], timeQuantum: number) => void;
  onBack: () => void;
  initialProcesses?: Process[];
  initialTimeQuantum?: number;
}

const ProcessConfigurationPage: React.FC<ProcessConfigurationPageProps> = ({
  selectedAlgorithm,
  onProcessesConfigured,
  onBack,
  initialProcesses,
  initialTimeQuantum
}) => {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses || []);
  const [processInput, setProcessInput] = useState<UserProcessInput>({ arrivalTime: '', burstTime: '', priority: '' });
  const [timeQuantum, setTimeQuantum] = useState<number>(initialTimeQuantum || DEFAULT_TIME_QUANTUM);
  const [nextProcId, setNextProcId] = useState(1);

  const algorithmDetails = ALGORITHM_OPTIONS.find(opt => opt.value === selectedAlgorithm);

  const isPriorityRelevant = 
    selectedAlgorithm === SchedulingAlgorithmType.PRIORITY_NP || 
    selectedAlgorithm === SchedulingAlgorithmType.PRIORITY_P ||
    selectedAlgorithm === SchedulingAlgorithmType.MQS;

  const isTimeQuantumRelevant = 
    selectedAlgorithm === SchedulingAlgorithmType.RR ||
    selectedAlgorithm === SchedulingAlgorithmType.MQS;

  useEffect(() => {
    if (initialProcesses) {
        setProcesses(initialProcesses);
        const maxId = initialProcesses.reduce((max, p) => {
            const num = parseInt(p.id.replace('P', ''), 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        setNextProcId(maxId + 1);
    } else {
        setProcesses([]);
        setNextProcId(1);
    }
    
    if (!isPriorityRelevant) {
        setProcessInput(prev => ({ ...prev, priority: '' }));
    } else {
        if (processInput.priority === '0' && selectedAlgorithm !== SchedulingAlgorithmType.MQS) { 
             setProcessInput(prev => ({ ...prev, priority: '' }));
        }
    }
  }, [initialProcesses, selectedAlgorithm, isPriorityRelevant, processInput.priority]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProcessInput(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProcess = (e?: React.FormEvent) => {
    e?.preventDefault();
    const arrivalTime = parseInt(processInput.arrivalTime, 10);
    const burstTime = parseInt(processInput.burstTime, 10);
    let priorityValue: number;

    if (isNaN(arrivalTime) || arrivalTime < 0) {
        alert("Please enter a valid, non-negative number for Arrival Time.");
        return;
    }
    if (isNaN(burstTime) || burstTime <= 0) {
        alert("Please enter a valid, positive number for Burst Time.");
        return;
    }

    if (isPriorityRelevant) {
        priorityValue = parseInt(processInput.priority, 10);
        if (isNaN(priorityValue) || priorityValue < 0) {
            alert("Please enter a valid, non-negative number for Priority.");
            return;
        }
    } else {
        priorityValue = 0; 
    }

    const newProcess: Process = {
      id: `P${nextProcId}`,
      name: `Process ${nextProcId}`,
      arrivalTime,
      burstTime,
      priority: priorityValue,
      color: PROCESS_COLORS[processes.length % PROCESS_COLORS.length],
      remainingBurstTime: burstTime,
    };
    setProcesses(prev => [...prev, newProcess]);
    setNextProcId(prev => prev + 1);
    setProcessInput({ arrivalTime: '', burstTime: '', priority: '' });
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleLoadDefaults = () => {
    const defaultProcs = getInitialDefaultProcesses();
    setProcesses(defaultProcs);
    setNextProcId(defaultProcs.length + 1);
  };

  const handleClearAll = () => {
    setProcesses([]);
    setNextProcId(1);
  };

  const handleStartSimulation = () => {
    if (processes.length < MIN_PROCESSES_FOR_SIMULATION) {
      alert(`Please add at least ${MIN_PROCESSES_FOR_SIMULATION} process(es) to start the simulation.`);
      return;
    }
    onProcessesConfigured(processes, isTimeQuantumRelevant ? timeQuantum : 0);
  };
  
  const buttonBaseStyle = "px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed";
  const primaryButtonStyle = `${buttonBaseStyle} bg-sky-600 hover:bg-sky-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-sky-500 hover:shadow-[0_0_15px_theme(colors.sky.700)]`;
  const secondaryButtonStyle = `${buttonBaseStyle} bg-slate-600 hover:bg-slate-500 text-slate-100 hover:shadow-md hover:scale-105 active:scale-95 focus:ring-slate-500 hover:shadow-[0_0_15px_theme(colors.slate.700)]`;
  const dangerButtonStyle = `${buttonBaseStyle} bg-rose-600 hover:bg-rose-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-rose-500 hover:shadow-[0_0_15px_theme(colors.rose.700)]`;
  const inputBaseStyle = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-colors duration-200 ease-in-out hover:border-slate-500";
  const containerStyle = "p-6 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/70 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] transition-shadow duration-300"; // Enhanced glow

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl mb-8 text-center">
         <h1 className="text-3xl sm:text-4xl font-bold text-sky-400 tracking-tight">Process Configuration</h1>
         <p className="text-slate-400 text-md mt-1">Algorithm: <span className="font-semibold text-sky-300">{algorithmDetails?.label || selectedAlgorithm}</span></p>
         <p className="text-slate-400 text-sm">Step 2: Define Processes {isTimeQuantumRelevant && '& Time Quantum'}</p>
      </header>

      <main className="w-full max-w-4xl space-y-6">
        {algorithmDetails && (
          <div className={`${containerStyle} border border-sky-700/50`}>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">About {algorithmDetails.label.split('(')[0].trim()}</h3>
            <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{algorithmDetails.longDescription}</p>
          </div>
        )}

        <form onSubmit={handleAddProcess} className={`${containerStyle} space-y-4`}>
          <h2 className="text-xl font-semibold text-sky-400 mb-3">Add New Process</h2>
          <div className={`grid grid-cols-1 md:grid-cols-${isPriorityRelevant ? '3' : '2'} gap-4`}>
            <div>
              <label htmlFor="arrivalTime" className="block text-sm font-medium text-slate-300 mb-1">Arrival Time</label>
              <input type="number" name="arrivalTime" id="arrivalTime" value={processInput.arrivalTime} onChange={handleInputChange} className={inputBaseStyle} min="0" placeholder="e.g., 0" required />
            </div>
            <div>
              <label htmlFor="burstTime" className="block text-sm font-medium text-slate-300 mb-1">Burst Time</label>
              <input type="number" name="burstTime" id="burstTime" value={processInput.burstTime} onChange={handleInputChange} className={inputBaseStyle} min="1" placeholder="e.g., 5" required />
            </div>
            {isPriorityRelevant && (
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                <input type="number" name="priority" id="priority" value={processInput.priority} onChange={handleInputChange} className={inputBaseStyle} min="0" placeholder="e.g., 1 (lower is higher)" required />
              </div>
            )}
          </div>
          <button type="submit" className={`${primaryButtonStyle} w-full md:w-auto`}>Add Process</button>
        
          {isTimeQuantumRelevant && (
            <div className="pt-4 border-t border-slate-700">
              <label htmlFor="timeQuantum" className="block text-sm font-medium text-slate-300 mb-1">Time Quantum (for {selectedAlgorithm})</label>
              <input
                type="number"
                id="timeQuantum"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value, 10) || DEFAULT_TIME_QUANTUM))}
                min="1"
                className={`${inputBaseStyle} w-full md:w-1/3`}
              />
            </div>
          )}
        </form>

        <div className={containerStyle}>
          <h2 className="text-xl font-semibold text-sky-400 mb-4">Current Processes ({processes.length})</h2>
          {processes.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar max-h-96">
              <table className="w-full min-w-max text-sm text-left text-slate-300">
                <thead className="text-xs text-sky-300 uppercase bg-slate-700/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Arrival</th>
                    <th className="px-4 py-3">Burst</th>
                    {isPriorityRelevant && <th className="px-4 py-3">Priority</th>}
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p) => (
                    <tr key={p.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/80 transition-colors duration-150">
                      <td className="px-4 py-3 font-medium">{p.id}</td>
                      <td className="px-4 py-3">{p.name}</td>
                      <td className="px-4 py-3">{p.arrivalTime}</td>
                      <td className="px-4 py-3">{p.burstTime}</td>
                      {isPriorityRelevant && <td className="px-4 py-3">{p.priority}</td>}
                      <td className="px-4 py-3"><div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: p.color }}></div></td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleRemoveProcess(p.id)} className="text-rose-400 hover:text-rose-300 font-medium text-xs px-2 py-1 rounded hover:bg-rose-700/50 transition-colors">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">No processes added yet. Add processes above or load defaults.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button onClick={handleLoadDefaults} className={secondaryButtonStyle}>Load Default Processes ({getInitialDefaultProcesses().length})</button>
            <button onClick={handleClearAll} className={`${dangerButtonStyle} opacity-80 hover:opacity-100`}>Clear All Processes</button>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button onClick={onBack} className={`${secondaryButtonStyle} w-full sm:w-auto`}>&larr; Back to Algorithm Selection</button>
            <button 
                onClick={handleStartSimulation} 
                disabled={processes.length < MIN_PROCESSES_FOR_SIMULATION}
                className={`${primaryButtonStyle} w-full sm:w-auto`}
                title={processes.length < MIN_PROCESSES_FOR_SIMULATION ? `Add at least ${MIN_PROCESSES_FOR_SIMULATION} process(es)`: `Run simulation with ${processes.length} process(es)`}
            >
                Start Simulation with these Processes &rarr;
            </button>
        </div>
      </main>
      <footer className="w-full max-w-4xl mt-12 py-6 text-center border-t border-slate-700/50">
        <p className="text-sm text-slate-500">Define your processes or load defaults. Click "Start Simulation" when ready.</p>
      </footer>
    </div>
  );
};

export default ProcessConfigurationPage;