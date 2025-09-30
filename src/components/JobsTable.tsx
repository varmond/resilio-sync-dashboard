'use client';

import { ResilioJob } from '@/types/resilio';
import { useDeleteJob } from '@/hooks/useResilioAPI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DeleteJobModal } from '@/components/DeleteJobModal';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface JobsTableProps {
  jobs: ResilioJob[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  const deleteJobMutation = useDeleteJob();
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: string; name: string } | null>(null);

  const getStatusIcon = (status: ResilioJob['status']) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-emerald-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-amber-500" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-slate-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: ResilioJob['status']) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'queued':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeColor = (type: ResilioJob['type']) => {
    switch (type) {
      case 'sync':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'backup':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'archive':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'transfer':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteClick = (jobId: string, jobName: string) => {
    setJobToDelete({ id: jobId, name: jobName });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    setDeletingJobId(jobToDelete.id);
    try {
      await deleteJobMutation.mutateAsync(jobToDelete.id);
      setDeleteModalOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setJobToDelete(null);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Job Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Files
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Started
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{job.name || 'Unnamed Job'}</div>
                    <div className="text-xs text-slate-500 font-mono truncate max-w-xs">
                      {job.sourcePath || 'Unknown'} → {job.destinationPath || 'Unknown'}
                    </div>
                    {job.errorMessage && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-xs">{job.errorMessage}</span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${getTypeColor(job.type)} border`}>
                    {job.type}
                  </Badge>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${getStatusColor(job.status)} border`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(job.status)}
                      <span className="capitalize">{job.status}</span>
                    </div>
                  </Badge>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {job.status === 'running' ? (
                    <div className="space-y-1 min-w-24">
                      <Progress value={job.progress || 0} className="h-2" />
                      <div className="text-xs text-slate-600">{job.progress || 0}%</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      {job.status === 'completed' ? '100%' : 
                       job.status === 'failed' ? 'Failed' : 
                       job.status === 'paused' ? 'Paused' : 'Queued'}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {job.agents && job.agents.length > 0 ? (
                      <div className="space-y-1">
                        {job.agents.map((agent, index) => (
                          <div key={index} className="text-xs">
                            Agent {agent.id} ({agent.permission})
                          </div>
                        ))}
                      </div>
                    ) : (
                      job.agentName || 'Unknown Agent'
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {(job.filesProcessed || 0).toLocaleString()} / {(job.totalFiles || 0).toLocaleString()}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {formatBytes(job.bytesTransferred || 0)} / {formatBytes(job.totalBytes || 0)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {formatDistanceToNow(job.startTime, { addSuffix: true })}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(job.id, job.name)}
                    disabled={deletingJobId === job.id}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingJobId === job.id && <span className="ml-1 text-xs">...</span>}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">
            <MoreHorizontal className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Jobs Found</h3>
          <p className="text-slate-600">
            No sync jobs are currently configured. Create your first job to get started.
          </p>
        </div>
      )}

      <DeleteJobModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        jobName={jobToDelete?.name || ''}
        isDeleting={deletingJobId === jobToDelete?.id}
      />
    </div>
  );
}
