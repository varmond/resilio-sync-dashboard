export interface ResilioAgent {
  id: string | number; // Allow both string and number IDs to handle real API data
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
  type: 'distribution' | 'consolidation' | 'script' | 'sync' | 'file_caching' | 'hybrid_work' | 'storage_tiering_and_archival';
  description?: string;
  groups: JobGroup[];
  agents: JobAgent[];
  triggers?: JobTriggers;
  script?: JobScript;
  scheduler?: JobScheduler;
  settings?: JobSettings;
  notifications?: JobNotification[];
}

export interface JobGroup {
  id: number;
  path: JobPath;
  role?: 'regular' | 'primary_storage' | 'caching_gateway' | 'enduser';
  file_policy_id?: number;
  priority_agents?: boolean;
  lock_server?: boolean;
  permission: 'ro' | 'rw' | 'sro' | 'srw';
}

export interface JobAgent {
  id: number;
  permission: 'ro' | 'rw' | 'sro' | 'srw';
  path: JobPath;
  storage_config_id?: number;
  role?: 'regular' | 'primary_storage' | 'caching_gateway' | 'enduser';
  file_policy_id?: number;
  priority_agents?: boolean;
  lock_server?: boolean;
}

export interface JobPath {
  macro?: '%FOLDERS_STORAGE%' | '%HOME%' | '%USERPROFILE%' | '%DOWNLOADS%' | '%USERDEFINED%' | '%GETFILES%';
  linux?: string;
  linux_cache?: string;
  win?: string;
  osx?: string;
  android?: string;
  xbox?: string;
}

export interface JobTriggers {
  pre_indexing?: JobCommand;
  pre_move?: JobCommand;
  post_download?: JobCommand;
  complete?: JobCommand;
}

export interface JobCommand {
  linux?: CommandDetails;
  win?: CommandDetails;
  osx?: CommandDetails;
  android?: CommandDetails;
  xbox?: CommandDetails;
}

export interface CommandDetails {
  script: string;
  shell?: string;
  ext?: string;
}

export interface JobScript {
  linux?: CommandDetails;
  win?: CommandDetails;
  osx?: CommandDetails;
}

export interface JobScheduler {
  type: 'once' | 'manually' | 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: number | number[];
  every?: number;
  days?: number[];
  start?: number;
  finish?: number;
  skip_if_running?: boolean;
  config?: MonthlyConfig[];
}

export interface MonthlyConfig {
  offset: number;
  unit: 'day' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  direction: 'month_beginning' | 'month_end';
  time: number;
}

export interface JobSettings {
  priority?: number;
  use_ram_optimization?: boolean;
  reference_agent_id?: number;
  reference_instance_id?: number;
  reference_instance_type?: 'group' | 'agent';
  profile?: JobProfile;
  delete_synced_files?: boolean;
  delete_synced_files_ttl?: number;
  archive_by?: 'path' | 'access_time' | 'modification_time';
  files_list?: string;
  modification_time?: TimeRange;
  access_time?: TimeRange;
  aws_s3_storage_class?: string;
  aws_s3_retrieval_tier?: string;
  use_file_locking?: boolean;
  file_locks_timeout?: number;
  file_locks_sync_interval?: number;
  file_locks_ignore_list?: string;
  file_locks_allowed_access_when_no_server?: 'no_access' | 'read_only' | 'full_access';
  map_folder_to_driver?: string;
  use_new_cipher?: boolean;
  post_command_local_time?: number;
  pre_move_command_local_time?: number;
  profile_id?: number;
}

export interface JobProfile {
  delete_synced_files?: boolean;
  delete_synced_files_ttl?: number;
  archive_by?: string;
  files_list?: string;
  modification_time?: TimeRange;
  access_time?: TimeRange;
  aws_s3_storage_class?: string;
  aws_s3_retrieval_tier?: string;
}

export interface TimeRange {
  max?: number;
  min?: number;
}

export interface JobNotification {
  destinations: NotificationDestination[];
  trigger: 'JOB_RUN_FINISHED' | 'JOB_RUN_FAILED' | 'JOB_RUN_NOT_COMPLETE' | 'JOB_RUN_ERROR';
  settings: NotificationSettings;
}

export interface NotificationDestination {
  email?: string;
  user_id?: number;
  web_hook_id?: number;
}

export interface NotificationSettings {
  error_code?: string;
  notify_after_error_timeout?: boolean;
  error_timeout?: number;
  notify_on_error_remove?: boolean;
  complete_timeout?: number;
  dont_send_if_no_data_transferred?: boolean;
}

export interface JobStatus {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'queued';
  progress: number;
  lastUpdate: Date;
  agent: string;
}
