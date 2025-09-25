export interface ResilioAgent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  lastSeen: Date;
  version: string;
  os: string;
  ip: string;
  port: number;
  isLocal: boolean;
  folders: number;
  peers: number;
}

export interface ResilioJob {
  id: string;
  name: string;
  type: 'sync' | 'backup' | 'archive' | 'transfer';
  status: 'running' | 'completed' | 'failed' | 'paused' | 'queued';
  progress: number;
  startTime: Date;
  endTime?: Date;
  sourcePath: string;
  destinationPath: string;
  agentId: string;
  agentName: string;
  filesProcessed: number;
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  errorMessage?: string;
}

export interface ResilioSystemInfo {
  version: string;
  os: string;
  build?: string;
  uptime: number;
  totalAgents: number;
  activeJobs: number;
}

export interface ResilioAPIResponse<T> {
  data: T;
  method: string;
  path: string;
  status: number;
}

export interface CreateJobRequest {
  name: string;
  type: 'sync' | 'backup' | 'archive' | 'transfer';
  sourcePath: string;
  destinationPath: string;
  agentId: string;
  options?: {
    recursive?: boolean;
    deleteSource?: boolean;
    overwrite?: boolean;
    schedule?: string;
  };
}

export interface JobStatus {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'queued';
  progress: number;
  lastUpdate: Date;
  agent: string;
}
