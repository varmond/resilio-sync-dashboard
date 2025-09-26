'use client';

import { ResilioAgent } from '@/types/resilio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Wifi, WifiOff, Clock, Folder, Users, MapPin, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AgentCardProps {
  agent: ResilioAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const getOnlineStatusIcon = () => {
    switch (agent.status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-emerald-600" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Server className="h-4 w-4 text-slate-400" />;
    }
  };

  const getOnlineStatusColor = () => {
    switch (agent.status) {
      case 'online':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'connecting':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getJobStatusIcon = () => {
    // This would be based on the agent's current job status
    // For now, we'll use a generic activity indicator
    return <Activity className="h-4 w-4 text-blue-600" />;
  };

  const getJobStatusColor = () => {
    // This would be based on the agent's current job status
    // For now, we'll use a neutral color
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <Card className="border-slate-200 bg-white hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Server className="h-5 w-5 text-slate-600 flex-shrink-0" />
            <CardTitle className="text-lg font-semibold text-slate-900 truncate">
              {agent.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Online Status Badge */}
            <Badge className={`${getOnlineStatusColor()} border`}>
              <div className="flex items-center gap-1">
                {getOnlineStatusIcon()}
                <span className="capitalize">{agent.status}</span>
              </div>
            </Badge>
            {/* Job Status Badge */}
            <Badge className={`${getJobStatusColor()} border`}>
              <div className="flex items-center gap-1">
                {getJobStatusIcon()}
                <span>Active</span>
              </div>
            </Badge>
          </div>
        </div>
        <CardDescription className="text-slate-600">
          {agent.isLocal ? 'Local Agent' : 'Remote Agent'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-3 w-3" />
              <span className="font-medium">Location</span>
            </div>
            <p className="text-sm font-mono text-slate-900">
              {agent.ip}:{agent.port}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Last Seen</span>
            </div>
            <p className="text-sm text-slate-900">
              {formatDistanceToNow(agent.lastSeen, { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Folder className="h-3 w-3" />
              <span className="font-medium">Folders</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{agent.folders}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="h-3 w-3" />
              <span className="font-medium">Peers</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">{agent.peers}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Version</span>
            <span className="font-mono text-slate-900">{agent.version}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-600">OS</span>
            <span className="text-slate-900 truncate">{agent.os}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
