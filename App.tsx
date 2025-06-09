import React, { useState, useEffect, useCallback } from 'react';
import { Process, SchedulingAlgorithmType, OverallMetrics, SimulationResult, SimulationEvent, AppView } from './types';
import { getInitialDefaultProcesses, ALGORITHM_OPTIONS, DEFAULT_TIME_QUANTUM, MIN_PROCESSES_FOR_SIMULATION } from './constants';
import ControlsPanel from './components/ControlsPanel';
import ProcessInputTable from './components/ProcessInputTable';
import GanttChart from './components/GanttChart';
import MetricsDisplay from './components/MetricsDisplay';
import SimulationView from './components/SimulationView';
import AlgorithmSelectionPage from './components/AlgorithmSelectionPage';
import ProcessConfigurationPage from './components/ProcessConfigurationPage';
import { runSimulation } from './services/schedulingService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('algorithmSelection');
  
  const [algorithmForConfiguration, setAlgorithmForConfiguration] = useState<SchedulingAlgorithmType | null>(null);
  const [configuredProcesses, setConfiguredProcesses] = useState<Process[]>([]);
  const [configuredTimeQuantum, setConfiguredTimeQuantum] = useState<number>(DEFAULT_TIME_QUANTUM);

  const [activeAlgorithm, setActiveAlgorithm] = useState<SchedulingAlgorithmType>(ALGORITHM_OPTIONS[0].value);
  const [activeTimeQuantum, setActiveTimeQuantum] = useState<number>(DEFAULT_TIME_QUANTUM);
  const [processesForDisplay, setProcessesForDisplay] = useState<Process[]>([]); 
  
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [currentSimulationStep, setCurrentSimulationStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isSimulationDone, setIsSimulationDone] = useState<boolean>(false);

  const processesMap = React.useMemo(() => {
    const map = new Map<string, Process>();
    const sourceProcesses = simulationResult?.detailedProcessInfo || configuredProcesses;
    sourceProcesses.forEach(p => {
      map.set(p.id, { ...p }); 
    });
    return map;
  }, [simulationResult?.detailedProcessInfo, configuredProcesses]);

  const handleAlgorithmSelected = (algorithm: SchedulingAlgorithmType) => {
    setAlgorithmForConfiguration(algorithm);
    setCurrentView('processConfiguration');
  };

  const handleProcessesConfigured = (procs: Process[], tq: number) => {
    setConfiguredProcesses(procs);
    setProcessesForDisplay(procs); 
    
    if (algorithmForConfiguration) {
      setActiveAlgorithm(algorithmForConfiguration); 
      // Set time quantum if the algorithm uses it (RR or MQS)
      if (algorithmForConfiguration === SchedulingAlgorithmType.RR || algorithmForConfiguration === SchedulingAlgorithmType.MQS) {
        setConfiguredTimeQuantum(tq);
        setActiveTimeQuantum(tq); 
      } else {
        setConfiguredTimeQuantum(DEFAULT_TIME_QUANTUM); 
        setActiveTimeQuantum(DEFAULT_TIME_QUANTUM); // Reset to default for non-TQ algos
      }
    }
    
    const result = runSimulation(procs, algorithmForConfiguration!, (algorithmForConfiguration === SchedulingAlgorithmType.RR || algorithmForConfiguration === SchedulingAlgorithmType.MQS) ? tq : undefined);
    setSimulationResult(result);
    setCurrentSimulationStep(0);
    setIsPlaying(false);
    setIsSimulationDone(true);
    setCurrentView('simulating');
  };
  
  const handleBackToAlgorithmSelection = () => {
    setAlgorithmForConfiguration(null);
    setCurrentView('algorithmSelection');
    setSimulationResult(null);
    setIsSimulationDone(false);
    setCurrentSimulationStep(0);
  };

  const handleRunOrReRunSimulation = useCallback(() => {
    if (configuredProcesses.length < MIN_PROCESSES_FOR_SIMULATION) {
      alert("Cannot run simulation: No processes configured. Please go back and set up processes.");
      if (algorithmForConfiguration) {
          setCurrentView('processConfiguration');
      } else {
          setCurrentView('algorithmSelection');
      }
      return;
    }
    // Use activeAlgorithm and activeTimeQuantum from ControlsPanel for re-runs
    const result = runSimulation(configuredProcesses, activeAlgorithm, (activeAlgorithm === SchedulingAlgorithmType.RR || activeAlgorithm === SchedulingAlgorithmType.MQS) ? activeTimeQuantum : undefined);
    setSimulationResult(result);
    setCurrentSimulationStep(0);
    setIsPlaying(false);
    setIsSimulationDone(true);
    setProcessesForDisplay(configuredProcesses); 
  }, [activeAlgorithm, activeTimeQuantum, configuredProcesses, algorithmForConfiguration]);


  const handleResetAndChangeConfiguration = () => {
    setAlgorithmForConfiguration(null);
    setConfiguredProcesses([]); 
    setConfiguredTimeQuantum(DEFAULT_TIME_QUANTUM);
    
    setActiveAlgorithm(ALGORITHM_OPTIONS[0].value); 
    setActiveTimeQuantum(DEFAULT_TIME_QUANTUM);
    setProcessesForDisplay([]);

    setSimulationResult(null);
    setCurrentSimulationStep(0);
    setIsPlaying(false);
    setIsSimulationDone(false);
    setCurrentView('algorithmSelection');
  };

  useEffect(() => {
    let timerId: number | null = null;
    if (isPlaying && simulationResult && currentSimulationStep < simulationResult.simulationLog.length - 1) {
      timerId = window.setTimeout(() => {
        setCurrentSimulationStep(prev => prev + 1);
      }, 1000 / simulationSpeed);
    } else if (isPlaying && simulationResult && currentSimulationStep >= simulationResult.simulationLog.length - 1) {
      setIsPlaying(false); 
    }
    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [isPlaying, currentSimulationStep, simulationResult, simulationSpeed]);

  const handleTogglePlay = () => {
    if (simulationResult && currentSimulationStep >= simulationResult.simulationLog.length -1 && !isPlaying) {
        setCurrentSimulationStep(0); 
    }
    setIsPlaying(prev => !prev);
  };

  const handleNextStep = () => {
    if (simulationResult && currentSimulationStep < simulationResult.simulationLog.length - 1) {
      setCurrentSimulationStep(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (currentSimulationStep > 0) {
      setCurrentSimulationStep(prev => prev - 1);
      setIsPlaying(false);
    }
  };
  
  const currentEvent: SimulationEvent | null = simulationResult ? simulationResult.simulationLog[currentSimulationStep] : null;
  const displayProcessesForMetrics = simulationResult?.detailedProcessInfo || configuredProcesses;


  if (currentView === 'algorithmSelection') {
    return <AlgorithmSelectionPage onAlgorithmSelect={handleAlgorithmSelected} />;
  }

  if (currentView === 'processConfiguration' && algorithmForConfiguration) {
    return (
      <ProcessConfigurationPage
        selectedAlgorithm={algorithmForConfiguration}
        onProcessesConfigured={handleProcessesConfigured}
        onBack={handleBackToAlgorithmSelection}
        initialProcesses={configuredProcesses.length > 0 ? configuredProcesses : undefined} 
        initialTimeQuantum={configuredTimeQuantum}
      />
    );
  }
  
  if (currentView === 'simulating') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8 transition-colors duration-300 ease-in-out">
        <header className="w-full max-w-7xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 md:w-12 md:h-12 mr-3 text-sky-400">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                <path d="M8.25 9.75A.75.75 0 0 1 9 9h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" />
              </svg>
              <div>
                 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-sky-400 tracking-tight">
                    CPU Scheduling Visualizer
                 </h1>
                 <p className="text-slate-400 text-base md:text-lg">
                    Algorithm: <span className="font-semibold text-sky-300">{ALGORITHM_OPTIONS.find(opt => opt.value === activeAlgorithm)?.label || activeAlgorithm}</span>
                    {(activeAlgorithm === SchedulingAlgorithmType.RR || activeAlgorithm === SchedulingAlgorithmType.MQS) && `, Time Quantum: ${activeTimeQuantum}`}
                 </p>
              </div>
            </div>
            <button 
                onClick={handleResetAndChangeConfiguration} 
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 text-sm"
            >
                Change Configuration
            </button>
          </div>
        </header>

        <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <ControlsPanel
              selectedAlgorithm={activeAlgorithm} 
              onAlgorithmChange={setActiveAlgorithm} 
              timeQuantum={activeTimeQuantum} 
              onTimeQuantumChange={setActiveTimeQuantum} 
              onStartSimulation={handleRunOrReRunSimulation} 
              onResetSimulation={handleResetAndChangeConfiguration}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              currentStep={currentSimulationStep}
              totalSteps={simulationResult?.simulationLog.length || 0}
              simulationSpeed={simulationSpeed}
              onSpeedChange={setSimulationSpeed}
              isSimulationDone={isSimulationDone}
            />
            <ProcessInputTable processes={processesForDisplay} activeAlgorithm={activeAlgorithm} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <SimulationView currentEvent={currentEvent} processesMap={processesMap} activeAlgorithm={activeAlgorithm} />
            <GanttChart
              ganttChartData={simulationResult?.ganttChartData || []}
              processes={configuredProcesses} 
              totalDuration={simulationResult?.overallMetrics.totalExecutionTime || 0}
            />
            <MetricsDisplay
              detailedProcessInfo={displayProcessesForMetrics}
              overallMetrics={simulationResult?.overallMetrics || null}
              activeAlgorithm={activeAlgorithm}
            />
          </div>
        </main>
        <footer className="w-full max-w-7xl mt-12 py-6 text-center border-t border-slate-700/50">
          <p className="text-sm text-slate-500 hover:text-slate-400 transition-colors duration-200">
            &copy; {new Date().getFullYear()} Process Scheduling Simulator. Crafted with React & Tailwind CSS.
          </p>
        </footer>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl text-red-500">An unexpected error occurred or invalid state.</h1>
      <button onClick={() => setCurrentView('algorithmSelection')} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded">
        Return to Start
      </button>
    </div>
  );
};

export default App;