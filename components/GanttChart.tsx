import React from 'react';
import { GanttChartEntry, Process } from '../types';

interface GanttChartProps {
  ganttChartData: GanttChartEntry[];
  processes: Process[]; 
  totalDuration: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ ganttChartData, processes, totalDuration }) => {
  const containerStyle = "p-6 bg-slate-800 rounded-xl shadow-2xl shadow-slate-900/70 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)] transition-shadow duration-300 overflow-x-auto custom-scrollbar"; // Enhanced glow

  if (ganttChartData.length === 0 || totalDuration === 0) {
    return <div className={`${containerStyle.replace("overflow-x-auto custom-scrollbar", "").replace("hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.3)]", "hover:shadow-sky-600/20")} text-center text-slate-400`}>Run simulation to view Gantt Chart.</div>;
  }

  const yAxisWidth = 120; 
  const rowHeight = 40; 
  const timeLabelHeight = 30; 
  const chartHeaderHeight = timeLabelHeight;
  const chartBodyHeight = processes.length * rowHeight;
  const chartHeight = chartBodyHeight + chartHeaderHeight;

  const processTimeSegments = processes.reduce((acc, process) => {
    acc[process.id] = ganttChartData.filter(entry => entry.processId === process.id);
    return acc;
  }, {} as Record<string, GanttChartEntry[]>);
  
  const timeTicks = [];
  let tickInterval = Math.max(1, Math.floor(totalDuration / 15)); 
  if (totalDuration > 50) tickInterval = Math.ceil(tickInterval / 5) * 5; 
  else if (totalDuration > 20) tickInterval = Math.ceil(tickInterval / 2) * 2;

  for (let i = 0; i <= totalDuration; i += tickInterval) {
    timeTicks.push(i);
  }
  if (timeTicks.length > 0 && timeTicks[timeTicks.length -1] < totalDuration && totalDuration > 0) {
     timeTicks.push(parseFloat(totalDuration.toFixed(0))); 
  }
  if (timeTicks.length > 1 && timeTicks[timeTicks.length-1] === timeTicks[timeTicks.length-2] && totalDuration % tickInterval !== 0) {
    timeTicks.pop();
  }
  if (timeTicks.length > 1 && timeTicks[timeTicks.length-1] !== totalDuration && totalDuration % tickInterval === 0 ) {
     if (!timeTicks.includes(totalDuration)) timeTicks.push(totalDuration);
  }
  if (totalDuration > 0 && !timeTicks.includes(0)) {
    timeTicks.unshift(0);
    timeTicks.sort((a,b) => a-b);
  }
  if (timeTicks.length > 1 && timeTicks[timeTicks.length-1] === timeTicks[timeTicks.length-2]) {
    timeTicks.pop();
  }


  return (
    <div className={containerStyle}>
      <h2 className="text-xl font-semibold text-sky-400 mb-6 border-b border-slate-700 pb-3">Gantt Chart</h2>
      <div style={{ height: `${chartHeight}px`, minWidth: `${yAxisWidth + Math.max(totalDuration * 15, 500)}px` }} className="relative">
        <div 
          className="absolute top-0 left-0 h-full bg-slate-800 z-10" 
          style={{ width: `${yAxisWidth}px` }}
        >
          {processes.map((process, index) => (
            <div
              key={process.id}
              className="text-xs text-slate-300 flex items-center justify-end pr-3 truncate h-full"
              title={process.name}
              style={{
                height: `${rowHeight}px`,
                top: `${chartHeaderHeight + index * rowHeight}px`, 
                position: 'absolute',
                width: '100%',
                borderRight: '1px solid #475569', 
                borderBottom: index < processes.length - 1 ? '1px dashed #334155' : '1px solid #475569', 
                 lineHeight: `${rowHeight}px`,
              }}
            >
              {process.name}
            </div>
          ))}
           <div style={{ height: `${chartHeaderHeight}px`, borderRight: '1px solid #475569', borderBottom: '1px solid #475569' }} />
        </div>

        <div className="absolute top-0" style={{ left: `${yAxisWidth}px`, height: '100%', width: `calc(100% - ${yAxisWidth}px)` }}>
          <div className="relative border-b border-slate-600" style={{ height: `${chartHeaderHeight}px` }}>
            {timeTicks.map((tick) => (
              <React.Fragment key={`tick-frag-${tick}`}>
                <div
                  className="absolute bottom-0 text-xs text-slate-400 transform -translate-x-1/2 pb-1"
                  style={{ left: `${totalDuration > 0 ? (tick / totalDuration) * 100 : 0}%` }}
                >
                  {tick.toFixed(0)}
                </div>
                <div
                  className="absolute top-0 w-px bg-slate-700/70" 
                  style={{ 
                    left: `${totalDuration > 0 ? (tick / totalDuration) * 100 : 0}%`,
                    height: `${chartHeight}px`, 
                  }}
                />
              </React.Fragment>
            ))}
          </div>
          
          <div className="relative" style={{height: `${chartBodyHeight}px`}}>
            {processes.map((process, index) => (
              <div
                key={`row-${process.id}`}
                className={`relative ${index % 2 === 0 ? 'bg-slate-700/20' : 'bg-transparent'}`} 
                style={{
                  height: `${rowHeight}px`,
                  borderBottom: index < processes.length - 1 ? '1px dashed #334155' : 'none', 
                }}
              >
                {(processTimeSegments[process.id] || []).map((entry, segIndex) => {
                  const barLeft = totalDuration > 0 ? (entry.start / totalDuration) * 100 : 0;
                  const barWidth = totalDuration > 0 ? Math.max(0.1, ((Math.max(entry.start, entry.end) - entry.start) / totalDuration) * 100) : 0; 
                  if (entry.end <= entry.start && totalDuration > 0) { 
                     return null; 
                  }

                  return (
                    <div
                      key={`${entry.processId}-${entry.start}-${segIndex}`}
                      title={`${entry.processName}: ${entry.start.toFixed(0)} - ${entry.end.toFixed(0)}`}
                      className="absolute h-2/3 top-1/2 transform -translate-y-1/2 rounded-sm flex items-center justify-center text-white text-[10px] font-medium overflow-hidden transition-all duration-150 ease-in-out hover:brightness-125 hover:shadow-lg cursor-pointer"
                      style={{
                        left: `${barLeft}%`,
                        width: `${barWidth}%`,
                        backgroundColor: entry.color,
                        minWidth: barWidth > 0.01 ? '2px' : '0px'
                      }}
                    >
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;