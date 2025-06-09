import React from 'react';
import { SimulationEvent, Process, SchedulingAlgorithmType } from '../types'; 
import ProcessBlock from './ProcessBlock';

interface SimulationViewProps {
  currentEvent: SimulationEvent | null;
  processesMap: Map<string, Process>; 
  activeAlgorithm: SchedulingAlgorithmType; 
}

const QueueColumn: React.FC<{ title: string; processes: Process[]; activeProcessId?: string | null, icon?: React.ReactNode, queueId?: string }> = ({ title, processes, activeProcessId, icon, queueId }) => (
  <div className="flex-1 p-4 bg-slate-700/70 rounded-lg min-w-[200px] shadow-inner hover:shadow-xl hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.35)] transition-shadow duration-300"> {/* Enhanced glow */}
    <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-slate-600/80 pb-2 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
      <span className="ml-auto text-xs font-normal bg-sky-800/70 text-sky-300 px-2 py-0.5 rounded-full">{processes.length}</span>
    </h3>
    <div className="space-y-2 min-h-[60px] max-h-72 overflow-y-auto custom-scrollbar pr-1">
      {processes.length === 0 && <p className="text-sm text-slate-400 italic pl-1">Empty</p>}
      {processes.map(p => <ProcessBlock key={`${queueId}-${p.id}`} process={p} isActive={p.id === activeProcessId}/>)}
    </div>
  </div>
);


const SimulationView: React.FC<SimulationViewProps> = ({ currentEvent, processesMap, activeAlgorithm }) => {
  const containerStyle = "p-6 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/70 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] transition-shadow duration-300 space-y-6"; // Enhanced glow
  
  if (!currentEvent) {
    return <div className={`${containerStyle.replace("space-y-6", "").replace("hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]", "hover:shadow-sky-600/20")} text-center text-slate-400`}>Start simulation to see animation.</div>;
  }

  const readyProcesses = currentEvent.readyQueue
    .map(p_in_queue => processesMap.get(p_in_queue.id))
    .filter(p => p !== undefined) as Process[];
    
  const mqsQ1Processes = (activeAlgorithm === SchedulingAlgorithmType.MQS && currentEvent.readyQueueMQS_Q1)
    ? currentEvent.readyQueueMQS_Q1
        .map(p_in_queue => processesMap.get(p_in_queue.id))
        .filter(p => p !== undefined) as Process[]
    : [];

  const completedProcesses = currentEvent.completedProcesses
    .map(p_in_queue => processesMap.get(p_in_queue.id))
    .filter(p => p !== undefined) as Process[];
    
  const runningProcess = currentEvent.runningProcess ? processesMap.get(currentEvent.runningProcess.id) || null : null;

  const ReadyIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sky-400"><path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>;
  const CpuIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sky-400"><path d="M3.505 2.365A41.369 41.369 0 0 1 10 2c2.236 0 4.43.18 6.595.534a1.75 1.75 0 0 0 .905-3.028C15.995-.29 13.09-.75 10-.75S4.005-.292 2.5.337A1.75 1.75 0 0 0 3.505 2.365ZM10 8a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 10 8ZM5.055 17.635A41.37 41.37 0 0 1 10 18c2.236 0 4.43-.18 6.595-.534a1.75 1.75 0 0 1 .905 3.028c-1.509.801-4.409 1.256-7.5 1.256s-5.991-.455-7.5-1.256a1.75 1.75 0 0 1 .905-3.028ZM2.25 10a.75.75 0 0 0-.75.75v.035c-.019.211-.033.424-.043.64A41.89 41.89 0 0 0 1.25 12c0 .316.008.63.023.944.01.215.025.43.045.645v.036a.75.75 0 0 0 1.5 0v-.035c.019-.211.033.424.043-.64A41.89 41.89 0 0 0 3.25 12c0-.316-.008-.63-.023-.944a44.04 44.04 0 0 0-.045-.645v-.036A.75.75 0 0 0 2.25 10Zm16.25.75a.75.75 0 0 1 .75-.75v.035c.019.211.033.424.043.64A41.89 41.89 0 0 1 18.75 12c0 .316-.008-.63-.023.944a44.042 44.042 0 0 1-.045.645v.036a.75.75 0 0 1-1.5 0v-.035a42.06 42.06 0 0 1-.043-.64A41.89 41.89 0 0 1 16.75 12c0-.316.008-.63.023-.944.01-.215.025-.43.045-.645v-.036A.75.75 0 0 1 17.75 10Z" /></svg>;
  const CompletedIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sky-400"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>;
  const RRIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sky-400"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.204 2.776l-.001-.001-.001-.001A5.5 5.5 0 0 1 10 5.5V2.75a.75.75 0 0 0-1.5 0V5.5a7 7 0 0 0 10.084 6.43l.001.001.001.001Z" clipRule="evenodd" /><path fillRule="evenodd" d="M11.75 8a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM8.25 8a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 8.25 8Z" clipRule="evenodd" /></svg>;
  const FCFSIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sky-400"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.001a1.5 1.5 0 0 1-1.052 1.767l-.933.28A20.118 20.118 0 0 0 10 18.5c.993 0 1.953-.138 2.863-.395l.206-.052a1.5 1.5 0 0 1 1.482.33L14.5 19.5h1.148a1.5 1.5 0 0 1 1.465-1.175l.716-3.001a1.5 1.5 0 0 1-1.052-1.767l-.933-.28A20.118 20.118 0 0 0 10 1.5c-.993 0-1.953.138-2.863.395l-.206.052a1.5 1.5 0 0 1-1.482-.33L5.5.5H3.5A1.5 1.5 0 0 1 2 2v1.5ZM4.22 5.74a.75.75 0 0 0 .13.99l1.25 1.25a.75.75 0 0 0 1.06 0l1.25-1.25a.75.75 0 0 0-.93-1.158L6 6.188V3.75a.75.75 0 0 0-1.5 0v3.188l-.94-.756a.75.75 0 0 0-1.158.13Z" /></svg>;


  return (
    <div className={containerStyle}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-3 mb-4">
        <h2 className="text-xl font-semibold text-sky-400 mb-2 sm:mb-0">Simulation State</h2>
        <div className="text-right w-full sm:w-auto">
          <div className="text-2xl font-bold text-slate-100">Time: {currentEvent.time.toFixed(0)}</div>
          <p className="text-xs text-amber-400 italic h-4 truncate" title={currentEvent.logMessage}>{currentEvent.logMessage}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {activeAlgorithm === SchedulingAlgorithmType.MQS ? (
          <>
            <QueueColumn title="MQS Q1 (RR)" processes={mqsQ1Processes} icon={RRIcon} queueId="mqs-q1" activeProcessId={runningProcess?.mqsQueueLevel === 1 ? runningProcess.id : null} />
            <QueueColumn title="MQS Q2 (FCFS)" processes={readyProcesses} icon={FCFSIcon} queueId="mqs-q2" activeProcessId={runningProcess?.mqsQueueLevel === 2 ? runningProcess.id : null}/>
          </>
        ) : (
          <QueueColumn title="Ready Queue" processes={readyProcesses} icon={ReadyIcon} queueId="ready" activeProcessId={runningProcess?.id} />
        )}
        
        <div className="flex-1 p-4 bg-slate-700/70 rounded-lg min-w-[200px] shadow-inner hover:shadow-xl hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.35)] transition-shadow duration-300"> {/* Enhanced glow for CPU box */}
          <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-slate-600/80 pb-2 flex items-center">
            {CpuIcon} <span className="ml-2">CPU</span>
          </h3>
          <div className="h-28 flex items-center justify-center rounded bg-slate-600/30 p-2">
            {runningProcess ? (
              <ProcessBlock process={runningProcess} isActive={true} />
            ) : (
              <p className="text-slate-400 italic text-center">
                {currentEvent.cpuIdle && currentEvent.time > 0 ? 'CPU Idle' : 'CPU Waiting...'}
              </p>
            )}
          </div>
        </div>

        <QueueColumn title="Completed Processes" processes={completedProcesses} icon={CompletedIcon} queueId="completed" />
      </div>
    </div>
  );
};

export default SimulationView;