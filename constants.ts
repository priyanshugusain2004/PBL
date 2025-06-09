
import { Process, SchedulingAlgorithmType, PROCESS_COLORS } from './types';

export const INITIAL_PROCESSES_DATA_TEMPLATE: Omit<Process, 'id' | 'name' | 'color' | 'remainingBurstTime' | 'mqsQueueLevel'>[] = [
  { arrivalTime: 0, burstTime: 8, priority: 2 },
  { arrivalTime: 1, burstTime: 4, priority: 1 },
  { arrivalTime: 2, burstTime: 9, priority: 4 },
  { arrivalTime: 3, burstTime: 5, priority: 3 },
  { arrivalTime: 4, burstTime: 2, priority: 5 },
  { arrivalTime: 5, burstTime: 6, priority: 2 },
  { arrivalTime: 10, burstTime: 3, priority: 1 },
  { arrivalTime: 12, burstTime: 7, priority: 3 },
];

export const getInitialDefaultProcesses = (): Process[] => {
  return INITIAL_PROCESSES_DATA_TEMPLATE.map((p, index) => ({
    ...p,
    id: `P${index + 1}`,
    name: `Process ${index + 1}`,
    color: PROCESS_COLORS[index % PROCESS_COLORS.length],
    remainingBurstTime: p.burstTime,
    // mqsQueueLevel: undefined by default, set by simulation logic
  }));
};

export const DEFAULT_TIME_QUANTUM = 4;
export const MIN_PROCESSES_FOR_SIMULATION = 1;
export const MQS_PRIORITY_THRESHOLD = 3; // Priorities < this threshold go to high-priority RR queue (e.g. 1, 2)
                                        // Priorities >= this threshold go to low-priority FCFS queue (e.g. 3, 4, 5)

export const ALGORITHM_OPTIONS = [
  { 
    value: SchedulingAlgorithmType.FCFS, 
    label: "First-Come, First-Served (FCFS)",
    description: "Processes are executed in the order they arrive.",
    longDescription: "First-Come, First-Served is the simplest CPU scheduling algorithm. Processes are dispatched according to their arrival time on the ready queue. Being a non-preemptive discipline, once a process has a CPU, it runs to completion. It is easy to understand and implement but can lead to long average waiting times, especially if short processes are stuck behind long ones (Convoy Effect)."
  },
  { 
    value: SchedulingAlgorithmType.SJF_NP, 
    label: "Shortest Job First (Non-Preemptive)",
    description: "The process with the smallest burst time is executed next. Non-preemptive.",
    longDescription: "Shortest Job First (Non-Preemptive) selects the waiting process with the smallest execution time (burst time) to execute next. Once a process starts, it runs to completion. This algorithm is provably optimal in terms of minimizing average waiting time, but it requires knowledge of future burst times and can lead to starvation for long processes."
  },
  { 
    value: SchedulingAlgorithmType.SJF_P, 
    label: "Shortest Job First (Preemptive - SRTF)",
    description: "Shortest Remaining Time First. Preemptive version of SJF.",
    longDescription: "Shortest Job First (Preemptive), also known as Shortest Remaining Time First (SRTF), is the preemptive version of SJF. If a new process arrives with a CPU burst length less than the remaining time of the current executing process, the current process is preempted. This can further reduce average waiting time but has higher overhead due to context switching and still risks starvation for long processes."
  },
  { 
    value: SchedulingAlgorithmType.PRIORITY_NP, 
    label: "Priority (Non-Preemptive)",
    description: "Processes are assigned priorities; higher priority processes run first. Non-preemptive.",
    longDescription: "Priority (Non-Preemptive) scheduling associates a priority with each process. The CPU is allocated to the process with the highest priority (typically, a smaller priority number implies higher priority). Once a process starts, it runs to completion. Starvation of low-priority processes is a potential problem, which can be mitigated using aging (gradually increasing the priority of waiting processes)."
  },
  { 
    value: SchedulingAlgorithmType.PRIORITY_P, 
    label: "Priority (Preemptive)",
    description: "Preemptive version of Priority scheduling.",
    longDescription: "Priority (Preemptive) scheduling allows a higher priority process to preempt a currently running lower priority process. This ensures that high-priority tasks are attended to more quickly. Like its non-preemptive counterpart, it can suffer from starvation of low-priority processes if not managed carefully (e.g., with aging)."
  },
  { 
    value: SchedulingAlgorithmType.RR, 
    label: "Round Robin (RR)",
    description: "Each process gets a small unit of CPU time (time quantum). Preemptive.",
    longDescription: "Round Robin is designed especially for time-sharing systems. It is similar to FCFS scheduling, but preemption is added to switch between processes. A small unit of time, called a time quantum or time slice, is defined. The ready queue is treated as a circular queue. The CPU scheduler goes around the ready queue, allocating the CPU to each process for a time interval of up to 1 time quantum. Performance depends heavily on the size of the time quantum."
  },
  { 
    value: SchedulingAlgorithmType.HRRN, 
    label: "Highest Response Ratio Next (HRRN)",
    description: "Selects process with highest (Wait Time + Burst Time) / Burst Time. Non-preemptive.",
    longDescription: "Highest Response Ratio Next is a non-preemptive scheduling algorithm that aims to mitigate the starvation issue in SJF. It selects the process with the highest response ratio, calculated as (Waiting Time + Burst Time) / Burst Time. This favors shorter jobs but also considers how long a process has been waiting, preventing indefinite postponement of longer jobs."
  },
  { 
    value: SchedulingAlgorithmType.MQS, 
    label: "Multi-level Queue (RR/FCFS)",
    description: "Uses multiple queues with different scheduling algorithms. (Here: High-Prio RR, Low-Prio FCFS).",
    longDescription: "Multi-level Queue scheduling partitions the ready queue into several separate queues. Processes are permanently assigned to one queue, generally based on some property of the process, such as memory size, process priority, or process type. Each queue has its own scheduling algorithm.\nThis implementation uses two queues:\n1. High Priority Queue: Uses Round Robin (RR) scheduling. Processes with user-defined priority less than " + MQS_PRIORITY_THRESHOLD + " go here.\n2. Low Priority Queue: Uses First-Come, First-Served (FCFS) scheduling. Processes with priority " + MQS_PRIORITY_THRESHOLD + " or greater go here.\nFixed priority preemptive scheduling is used between the queues; the high-priority queue tasks are run first. If a high-priority process arrives while a low-priority process is running, the low-priority process is preempted."
  },
];
