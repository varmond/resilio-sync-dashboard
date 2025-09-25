'use client';

import { ResilioJob } from '@/types/resilio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  Folder,
  Server,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDeleteJob } from '@/hooks/useResilioAPI';
import { useState } from 'react';

interface JobCardProps {
  job: ResilioJob;
}

export function JobCard({ job }: JobCardProps) {
  const deleteJobMutation = useDeleteJob();
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusIcon = () => {
    switch (job.status) {
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
        return <Briefcase className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
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

  const getTypeColor = () => {
    switch (job.type) {
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

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the job "${job.name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteJobMutation.mutateAsync(job.id);
      } catch (error) {
        console.error('Failed to delete job:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold text-slate-900 truncate">
              {job.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getTypeColor()} border`}>
              {job.type}
            </Badge>
            <Badge className={`${getStatusColor()} border`}>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="capitalize">{job.status}</span>
              </div>
            </Badge>
          </div>
        </div>
        <CardDescription className="text-slate-600">
          Running on {job.agentName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {job.status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium text-slate-900">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-2" />
          </div>
        )}

        {/* File Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Folder className="h-3 w-3" />
              <span className="font-medium">Files</span>
            </div>
            <p className="text-sm text-slate-900">
              {job.filesProcessed.toLocaleString()} / {job.totalFiles.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Server className="h-3 w-3" />
              <span className="font-medium">Data</span>
            </div>
            <p className="text-sm text-slate-900">
              {formatBytes(job.bytesTransferred)} / {formatBytes(job.totalBytes)}
            </p>
          </div>
        </div>

        {/* Paths */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-600">Source</div>
            <p className="text-sm font-mono text-slate-900 truncate bg-slate-50 p-2 rounded">
              {job.sourcePath}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-600">Destination</div>
            <p className="text-sm font-mono text-slate-900 truncate bg-slate-50 p-2 rounded">
              {job.destinationPath}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {job.errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{job.errorMessage}</p>
          </div>
        )}

        {/* Timing Information */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Started</span>
            <span className="text-slate-900">
              {formatDistanceToNow(job.startTime, { addSuffix: true })}
            </span>
          </div>
          {job.endTime && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-600">Completed</span>
              <span className="text-slate-900">
                {formatDistanceToNow(job.endTime, { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
