export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number; // Lower number means higher priority
  color: string;
  remainingBurstTime: number;
  startTime?: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
  // For MQS, to internally track which queue a process belongs to after assignment
  mqsQueueLevel?: 1 | 2; // 1 for High Priority (e.g., RR), 2 for Low Priority (e.g., FCFS)
}

// For the form input, before full Process object is created
export interface UserProcessInput {
  arrivalTime: string; // Parsed to number later
  burstTime: string;   // Parsed to number later
  priority: string;    // Parsed to number later
}

export enum SchedulingAlgorithmType {
  FCFS = "FCFS",
  SJF_NP = "SJF_NP", // Shortest Job First (Non-Preemptive)
  SJF_P = "SJF_P",   // Shortest Job First (Preemptive) / SRTF
  PRIORITY_NP = "PRIORITY_NP",
  PRIORITY_P = "PRIORITY_P",
  RR = "RR",       // Round Robin
  HRRN = "HRRN",     // Highest Response Ratio Next
  MQS = "MQS",       // Multi-level Queue Scheduling
}

export interface GanttChartEntry {
  processId: string;
  processName: string;
  start: number;
  end: number;
  color: string;
}

export interface ProcessMetrics {
  id:string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
  mqsQueueLevel?: 1 | 2;
}

export interface OverallMetrics {
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  cpuUtilization: number; // Percentage
  throughput: number; // Processes per unit time
  totalExecutionTime: number;
}

export interface SimulationEvent {
  time: number;
  runningProcess: Process | null;
  // For MQS, these might represent combined queues or specific queue states
  readyQueue: Process[]; 
  readyQueueMQS_Q1?: Process[]; // Optional: For detailed MQS view
  readyQueueMQS_Q2?: Process[]; // Optional: For detailed MQS view
  completedProcesses: Process[];
  ganttChartSnapshot: GanttChartEntry[];
  cpuIdle: boolean;
  logMessage: string; // Short message describing event at this time unit
}

export interface SimulationResult {
  ganttChartData: GanttChartEntry[];
  detailedProcessInfo: Process[]; // Processes with all metrics calculated
  overallMetrics: OverallMetrics;
  simulationLog: SimulationEvent[];
}

export const PROCESS_COLORS: string[] = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#2ECC71', '#E74C3C',
  '#F1C40F', '#3498DB', '#1ABC9C', '#8E44AD',
  '#D35400', '#27AE60', '#C0392B', '#7F8C8D' // Added more colors
];

export type AppView = 'algorithmSelection' | 'processConfiguration' | 'simulating';