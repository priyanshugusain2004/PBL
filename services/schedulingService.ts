
import { Process, SchedulingAlgorithmType, GanttChartEntry, OverallMetrics, SimulationResult, SimulationEvent } from '../types';
import { MQS_PRIORITY_THRESHOLD } from '../constants';

// Helper to clone processes to avoid mutating original data during simulation
const cloneProcesses = (processes: Process[]): Process[] =>
  processes.map(p => ({ 
    ...p, 
    remainingBurstTime: p.burstTime, 
    startTime: undefined, 
    completionTime: undefined, 
    turnaroundTime: undefined, 
    waitingTime: undefined, 
    responseTime: undefined,
    mqsQueueLevel: undefined, // Reset MQS queue level
  }));

const calculateMetrics = (processes: Process[], totalTime: number, totalIdleTime: number): { detailedProcessInfo: Process[], overallMetrics: OverallMetrics } => {
  const completedProcesses = processes.filter(p => p.completionTime !== undefined);
  
  // If no processes completed and no time elapsed, return zero metrics
  // Otherwise, if time elapsed, CPU utilization might be 0 but total time is recorded
  if (completedProcesses.length === 0 && totalTime === 0) {
    return {
      detailedProcessInfo: processes.map(p => ({...p})), // Return copies
      overallMetrics: {
        averageTurnaroundTime: 0,
        averageWaitingTime: 0,
        averageResponseTime: 0,
        cpuUtilization: 0,
        throughput: 0,
        totalExecutionTime: totalTime,
      }
    };
  }

  // Calculate metrics for each completed process
  completedProcesses.forEach(p => {
    if (p.completionTime === undefined) return; // Should not happen due to filter, but for type safety
    p.turnaroundTime = p.completionTime - p.arrivalTime;
    p.waitingTime = Math.max(0, (p.turnaroundTime ?? 0) - p.burstTime); // Ensure non-negative

    if (p.startTime !== undefined) {
      p.responseTime = p.startTime - p.arrivalTime;
    } else if (p.completionTime !== undefined) { 
      // Fallback for response time if startTime is somehow not set (e.g. process never ran but "completed")
      p.responseTime = Math.max(0, (p.turnaroundTime ?? 0) - p.burstTime); // Similar to waiting time in this edge case
    }
  });

  // Filter again for processes that successfully had metrics calculated (e.g., turnaroundTime is not undefined)
  const validCompletedProcesses = completedProcesses.filter(p => p.turnaroundTime !== undefined);

  const totalTurnaroundTime = validCompletedProcesses.reduce((sum, p) => sum + (p.turnaroundTime ?? 0), 0);
  const totalWaitingTime = validCompletedProcesses.reduce((sum, p) => sum + (p.waitingTime ?? 0), 0);
  const totalResponseTime = validCompletedProcesses.reduce((sum, p) => sum + (p.responseTime ?? 0), 0);

  const numValidCompleted = validCompletedProcesses.length;

  const overallMetrics: OverallMetrics = {
    averageTurnaroundTime: numValidCompleted > 0 ? totalTurnaroundTime / numValidCompleted : 0,
    averageWaitingTime: numValidCompleted > 0 ? totalWaitingTime / numValidCompleted : 0,
    averageResponseTime: numValidCompleted > 0 ? totalResponseTime / numValidCompleted : 0,
    cpuUtilization: totalTime > 0 ? Math.max(0, Math.min(100, ((totalTime - totalIdleTime) / totalTime) * 100)) : 0,
    throughput: totalTime > 0 && numValidCompleted > 0 ? numValidCompleted / totalTime : 0,
    totalExecutionTime: totalTime,
  };
  
  // Create final list of all processes, merging calculated metrics for those that completed
  const allProcessInfo = processes.map(originalProcess => {
    const foundCompleted = validCompletedProcesses.find(cp => cp.id === originalProcess.id);
    return foundCompleted ? { ...foundCompleted } : { ...originalProcess }; // Return a copy
  });

  return { detailedProcessInfo: allProcessInfo, overallMetrics };
};


export const runSimulation = (
  initialProcesses: Process[],
  algorithm: SchedulingAlgorithmType,
  timeQuantumArg?: number // Renamed to avoid conflict with MQS internal quantum
): SimulationResult => {
  let processes = cloneProcesses(initialProcesses);
  const ganttChartData: GanttChartEntry[] = [];
  const simulationLog: SimulationEvent[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let totalIdleTime = 0;

  // Queues
  let readyQueue: Process[] = []; // General ready queue, or low-priority for MQS
  let mqs_rr_queue: Process[] = []; // High-priority RR queue for MQS

  let currentProcess: Process | null = null;
  let currentProcessStartTime = 0; 
  let rrQuantumSlice = 0; // For RR and MQS's RR part
  const effectiveTimeQuantum = timeQuantumArg || 1;


  const logEvent = (message: string, cpuIdleOverride: boolean = false) => {
    const event: SimulationEvent = {
      time: currentTime,
      runningProcess: currentProcess ? { ...currentProcess } : null,
      readyQueue: readyQueue.map(p => ({ ...p })), // Main/FCFS queue for MQS
      completedProcesses: processes.filter(p => p.completionTime !== undefined).map(p => ({ ...p })),
      ganttChartSnapshot: [...ganttChartData],
      cpuIdle: currentProcess === null || cpuIdleOverride,
      logMessage: message,
    };
    if (algorithm === SchedulingAlgorithmType.MQS) {
      event.readyQueueMQS_Q1 = mqs_rr_queue.map(p => ({ ...p }));
    }
    simulationLog.push(event);
  };
  
  logEvent("Simulation started. Waiting for processes.");
  let effectiveTotalTime = 0;

  while (completedCount < processes.length) {
    let newArrivalsThisTick = false;
    processes.forEach(p => {
      if (p.arrivalTime === currentTime && p.completionTime === undefined && 
          !readyQueue.find(rp => rp.id === p.id) && 
          !mqs_rr_queue.find(rp => rp.id === p.id) && 
          (!currentProcess || currentProcess.id !== p.id)) {
        
        newArrivalsThisTick = true;
        if (algorithm === SchedulingAlgorithmType.MQS) {
          p.mqsQueueLevel = p.priority < MQS_PRIORITY_THRESHOLD ? 1 : 2;
          if (p.mqsQueueLevel === 1) {
            mqs_rr_queue.push(p);
            logEvent(`Process ${p.id} (Prio ${p.priority}) arrived, assigned to MQS High-Prio (RR) Queue.`);
          } else {
            readyQueue.push(p); // Low-priority for MQS goes to the general 'readyQueue'
            logEvent(`Process ${p.id} (Prio ${p.priority}) arrived, assigned to MQS Low-Prio (FCFS) Queue.`);
          }
        } else {
          readyQueue.push(p);
          logEvent(`Process ${p.id} (BT: ${p.burstTime}, Prio: ${p.priority}) arrived.`);
        }
      }
    });
    
    // Preemption check for SJF_P, PRIORITY_P, MQS
    if (newArrivalsThisTick && currentProcess) {
      let preempt = false;
      if (algorithm === SchedulingAlgorithmType.SJF_P) {
        const shortestInQueue = readyQueue.reduce((shortest, p) => (p.remainingBurstTime < shortest.remainingBurstTime ? p : shortest), { remainingBurstTime: Infinity } as Process);
        if (shortestInQueue.remainingBurstTime < currentProcess.remainingBurstTime) preempt = true;
      } else if (algorithm === SchedulingAlgorithmType.PRIORITY_P) {
        const highestPriorityInQueue = readyQueue.reduce((highest, p) => (p.priority < highest.priority ? p : highest), { priority: Infinity } as Process);
        if (highestPriorityInQueue.priority < currentProcess.priority) preempt = true;
      } else if (algorithm === SchedulingAlgorithmType.MQS && currentProcess.mqsQueueLevel === 2 && mqs_rr_queue.length > 0) {
        // If current process is from Low-Prio MQS queue and High-Prio MQS queue has arrivals
        preempt = true;
        logEvent(`MQS: High-priority process arrived. Preempting ${currentProcess.id} from Low-Prio queue.`);
      }

      if (preempt) {
        if (currentTime > currentProcessStartTime) {
             ganttChartData.push({ processId: currentProcess.id, processName: currentProcess.name, start: currentProcessStartTime, end: currentTime, color: currentProcess.color });
        }
        // Add current process back to its appropriate queue
        if (algorithm === SchedulingAlgorithmType.MQS && currentProcess.mqsQueueLevel === 2) {
             readyQueue.push(currentProcess); // It was from the MQS Low-Prio queue
        } else if (algorithm === SchedulingAlgorithmType.MQS && currentProcess.mqsQueueLevel === 1){
             mqs_rr_queue.push(currentProcess); // Should not happen if Q1 preempts Q2, but for logical completeness if Q1 could preempt Q1
        }
         else {
             readyQueue.push(currentProcess); // General preemption
        }
        currentProcess = null;
        rrQuantumSlice = 0; // Reset quantum if preempted
      }
    }

    // Process selection logic
    if (currentProcess === null) {
      let queueToUse = readyQueue; // Default queue

      if (algorithm === SchedulingAlgorithmType.MQS) {
        if (mqs_rr_queue.length > 0) {
          queueToUse = mqs_rr_queue; // Prioritize MQS RR queue
          currentProcess = queueToUse.shift()!;
          rrQuantumSlice = effectiveTimeQuantum;
        } else if (readyQueue.length > 0) { // MQS FCFS queue
          readyQueue.sort((a,b) => a.arrivalTime - b.arrivalTime); // Ensure FCFS for this queue
          currentProcess = readyQueue.shift()!;
        }
      } else if (readyQueue.length > 0) {
          switch (algorithm) {
            case SchedulingAlgorithmType.FCFS:
              readyQueue.sort((a,b) => a.arrivalTime - b.arrivalTime);
              currentProcess = readyQueue.shift()!;
              break;
            case SchedulingAlgorithmType.SJF_NP: 
              readyQueue.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
              currentProcess = readyQueue.shift()!;
              break;
            case SchedulingAlgorithmType.PRIORITY_NP: 
              readyQueue.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
              currentProcess = readyQueue.shift()!;
              break;
            case SchedulingAlgorithmType.SJF_P:
              readyQueue.sort((a, b) => a.remainingBurstTime - b.remainingBurstTime || a.arrivalTime - b.arrivalTime);
              currentProcess = readyQueue.shift()!;
              break;
            case SchedulingAlgorithmType.PRIORITY_P:
              readyQueue.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
              currentProcess = readyQueue.shift()!;
              break;
            case SchedulingAlgorithmType.RR:
              currentProcess = readyQueue.shift()!; 
              rrQuantumSlice = effectiveTimeQuantum;
              break;
            case SchedulingAlgorithmType.HRRN:
              readyQueue.forEach(p => {
                  p.waitingTime = currentTime - p.arrivalTime; // Update waiting time for HRRN calculation
              });
              readyQueue.sort((a, b) => {
                  const responseRatioA = ((a.waitingTime ?? 0) + a.burstTime) / a.burstTime;
                  const responseRatioB = ((b.waitingTime ?? 0) + b.burstTime) / b.burstTime;
                  if (responseRatioB !== responseRatioA) return responseRatioB - responseRatioA; // Higher ratio first
                  return a.arrivalTime - b.arrivalTime; // Tie-breaking with FCFS
              });
              currentProcess = readyQueue.shift()!;
              break;
          }
      }
      
      if (currentProcess) {
        if (currentProcess.startTime === undefined) {
          currentProcess.startTime = currentTime;
        }
        currentProcessStartTime = currentTime;
        const queueInfo = algorithm === SchedulingAlgorithmType.MQS ? `(from MQS Q${currentProcess.mqsQueueLevel})` : '';
        logEvent(`Process ${currentProcess.id} ${queueInfo} starts/resumes execution (Rem BT: ${currentProcess.remainingBurstTime}).`);
      }
    }

    // Process execution and termination
    if (currentProcess === null) {
      const willBeIdle = readyQueue.length === 0 && mqs_rr_queue.length === 0 && processes.every(p => p.arrivalTime > currentTime || p.completionTime !== undefined);
      if (simulationLog.length === 0 || !simulationLog[simulationLog.length-1].cpuIdle || simulationLog[simulationLog.length-1].logMessage !== "CPU Idle. Waiting for next process or arrival.") {
         if (willBeIdle || completedCount < processes.length) {
            logEvent("CPU Idle. Waiting for next process or arrival.", true);
         }
      }
      if (completedCount < processes.length) {
        totalIdleTime++;
      }
    } else { 
      currentProcess.remainingBurstTime--;
      
      const isMqsRrProcess = algorithm === SchedulingAlgorithmType.MQS && currentProcess.mqsQueueLevel === 1;
      const isStandardRrProcess = algorithm === SchedulingAlgorithmType.RR;

      if (isStandardRrProcess || isMqsRrProcess) {
        rrQuantumSlice--;
      }

      if (currentProcess.remainingBurstTime === 0) {
        currentProcess.completionTime = currentTime + 1;
        ganttChartData.push({ processId: currentProcess.id, processName: currentProcess.name, start: currentProcessStartTime, end: currentProcess.completionTime, color: currentProcess.color });
        logEvent(`Process ${currentProcess.id} completed at t=${currentProcess.completionTime}.`);
        completedCount++;
        const processIndexInProcesses = processes.findIndex(p => p.id === currentProcess!.id);
        if(processIndexInProcesses !== -1) processes[processIndexInProcesses] = {...currentProcess};
        currentProcess = null;
        rrQuantumSlice = 0; 
      } 
      else if ((isStandardRrProcess || isMqsRrProcess) && rrQuantumSlice === 0) {
        ganttChartData.push({ processId: currentProcess.id, processName: currentProcess.name, start: currentProcessStartTime, end: currentTime + 1, color: currentProcess.color });
        logEvent(`Process ${currentProcess.id} time quantum expired. Moved to ready queue (Rem BT: ${currentProcess.remainingBurstTime}).`);
        
        if (isMqsRrProcess) mqs_rr_queue.push(currentProcess);
        else readyQueue.push(currentProcess);
        
        currentProcess = null;
      }
      else {
         // Log if process changed or was idle
         if (simulationLog.length === 0 || simulationLog[simulationLog.length-1].runningProcess?.id !== currentProcess.id || 
             simulationLog[simulationLog.length-1].cpuIdle) {
            logEvent(`Process ${currentProcess.id} continues execution (Rem BT: ${currentProcess.remainingBurstTime}).`);
         }
      }
    }
    
    currentTime++; 

    // Force stop check
    if (currentTime > 2000 && completedCount < processes.length) { 
        effectiveTotalTime = currentTime -1; 
        logEvent(`Simulation force stopped at t=${effectiveTotalTime} due to exceeding 2000 time units.`);
        processes.forEach(p => { 
            if (p.completionTime === undefined) {
                p.completionTime = effectiveTotalTime;
                if (p.startTime === undefined && p.arrivalTime <= effectiveTotalTime) p.startTime = p.arrivalTime;
                p.turnaroundTime = p.completionTime - p.arrivalTime;
                p.waitingTime = Math.max(0, (p.turnaroundTime ?? 0) - p.burstTime);
                if (p.startTime !== undefined) p.responseTime = p.startTime - p.arrivalTime; else p.responseTime = p.waitingTime;
            }
        });
        completedCount = processes.length;
        break; 
    }
    
    // Fast-forward if idle
    if (currentProcess === null && readyQueue.length === 0 && mqs_rr_queue.length === 0 && completedCount < processes.length) {
        let nextArrivalTime = Infinity;
        processes.forEach(p => {
            if (p.completionTime === undefined && p.arrivalTime > currentTime -1 ) {
                nextArrivalTime = Math.min(nextArrivalTime, p.arrivalTime);
            }
        });

        if (nextArrivalTime !== Infinity && nextArrivalTime > currentTime -1) {
            const jumpToTime = nextArrivalTime;
            const idleDuration = jumpToTime - (currentTime-1);
            if (idleDuration > 0) {
              logEvent(`CPU Idle. Fast-forwarding by ${idleDuration} unit(s) to next arrival at t=${jumpToTime}.`, true);
              totalIdleTime += idleDuration; 
              currentTime = jumpToTime; 
            }
        } else if (nextArrivalTime === Infinity && completedCount < processes.length) {
            logEvent("Error: CPU idle, no new arrivals, but not all processes completed. Simulation stuck.", true);
            effectiveTotalTime = currentTime; 
            processes.forEach(p => { if (p.completionTime === undefined) p.completionTime = effectiveTotalTime;});
            break; 
        }
    }
  }
  
  if (effectiveTotalTime === 0) {
    effectiveTotalTime = currentTime; 
  }
  
  const finalCompletionTime = Math.max(...processes.map(p => p.completionTime || 0), 0);
  if (completedCount === processes.length) {
    const lastLog = simulationLog[simulationLog.length - 1];
    const completionMessage = `All ${processes.length} processes completed. Total time: ${effectiveTotalTime}.`;
    // Add final completion message only if not already similar or if last event wasn't a completion at the right time
    if (!lastLog || !lastLog.logMessage.startsWith("All") || lastLog.time < finalCompletionTime -1 ) {
         simulationLog.push({
            time: Math.max(lastLog?.time ?? 0, finalCompletionTime > 0 ? finalCompletionTime -1 : 0), // Log at the time of the last action or after
            runningProcess: null, 
            readyQueue: [], 
            readyQueueMQS_Q1: [],
            completedProcesses: processes.map(p=>({...p})), 
            ganttChartSnapshot: [...ganttChartData], 
            cpuIdle: true, 
            logMessage: completionMessage
        });
    }
  }
  

  const { detailedProcessInfo, overallMetrics } = calculateMetrics(processes, effectiveTotalTime, totalIdleTime);
  
  return { ganttChartData, detailedProcessInfo, overallMetrics, simulationLog };
};