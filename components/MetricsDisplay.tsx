import React from 'react';
import { Process, OverallMetrics, SchedulingAlgorithmType } from '../types';

interface MetricsDisplayProps {
  detailedProcessInfo: Process[];
  overallMetrics: OverallMetrics | null;
  activeAlgorithm?: SchedulingAlgorithmType; 
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ detailedProcessInfo, overallMetrics, activeAlgorithm }) => {
  const containerStyle = "p-6 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/70 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] transition-shadow duration-300 space-y-6"; // Enhanced glow
  
  if (!overallMetrics || detailedProcessInfo.length === 0) {
    return <div className={`${containerStyle.replace("space-y-6","").replace("hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]", "hover:shadow-sky-600/20")} text-center text-slate-400`}>Run a simulation to see metrics.</div>;
  }
  
  const isPriorityRelevant = 
    activeAlgorithm === SchedulingAlgorithmType.PRIORITY_NP || 
    activeAlgorithm === SchedulingAlgorithmType.PRIORITY_P ||
    activeAlgorithm === SchedulingAlgorithmType.MQS;

  const MetricCard: React.FC<{ title: string; value: string | number; unit?: string }> = ({ title, value, unit }) => (
    <div className="bg-slate-700 p-4 rounded-lg shadow-md text-center transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl hover:shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)] hover:bg-slate-600/80"> {/* Refined MetricCard glow */}
      <h4 className="text-sm text-sky-400 font-medium">{title}</h4>
      <p className="text-2xl font-bold text-slate-100">
        {typeof value === 'number' ? value.toFixed(2) : value}
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div className={containerStyle}>
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-4 border-b border-slate-700 pb-3">Overall Performance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard title="Avg Turnaround" value={overallMetrics.averageTurnaroundTime} unit="ms" />
          <MetricCard title="Avg Waiting" value={overallMetrics.averageWaitingTime} unit="ms" />
          <MetricCard title="Avg Response" value={overallMetrics.averageResponseTime} unit="ms" />
          <MetricCard title="CPU Utilization" value={overallMetrics.cpuUtilization} unit="%" />
          <MetricCard title="Throughput" value={overallMetrics.throughput.toFixed(3)} unit="P/ms" />
        </div>
         <p className="text-xs text-slate-500 mt-3 text-center">Total Execution Time: {overallMetrics.totalExecutionTime.toFixed(2)} ms</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-4 border-b border-slate-700 pb-3">Process Metrics</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-max text-sm text-left text-slate-300">
            <thead className="text-xs text-sky-300 uppercase bg-slate-700/50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Arrival</th>
                <th className="px-4 py-2">Burst</th>
                {isPriorityRelevant && <th className="px-4 py-2">Priority</th>}
                {activeAlgorithm === SchedulingAlgorithmType.MQS && <th className="px-4 py-2">MQS Queue</th>}
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">Completion</th>
                <th className="px-4 py-2">Turnaround</th>
                <th className="px-4 py-2">Waiting</th>
                <th className="px-4 py-2">Response</th>
              </tr>
            </thead>
            <tbody>
              {detailedProcessInfo.map((p) => (
                <tr key={p.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/80 transition-colors duration-150 ease-in-out">
                  <td className="px-4 py-2 font-medium">{p.id}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.arrivalTime}</td>
                  <td className="px-4 py-2">{p.burstTime}</td>
                  {isPriorityRelevant && <td className="px-4 py-2">{p.priority}</td>}
                  {activeAlgorithm === SchedulingAlgorithmType.MQS && <td className="px-4 py-2">{p.mqsQueueLevel ? `Q${p.mqsQueueLevel}` : '-'}</td>}
                  <td className="px-4 py-2">{p.startTime?.toFixed(0) ?? '-'}</td>
                  <td className="px-4 py-2">{p.completionTime?.toFixed(0) ?? '-'}</td>
                  <td className="px-4 py-2">{p.turnaroundTime?.toFixed(2) ?? '-'}</td>
                  <td className="px-4 py-2">{p.waitingTime?.toFixed(2) ?? '-'}</td>
                  <td className="px-4 py-2">{p.responseTime?.toFixed(2) ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;