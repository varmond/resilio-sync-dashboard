'use client';

import { ResilioSystemInfo } from '@/types/resilio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, Briefcase } from 'lucide-react';

interface SystemStatusProps {
  systemInfo?: ResilioSystemInfo;
  agentsCount?: number;
  jobsCount?: number;
}

export function SystemStatus({ systemInfo, agentsCount = 0, jobsCount = 0 }: SystemStatusProps) {
  
  if (!systemInfo) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Version</CardTitle>
          <Activity className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{systemInfo.version || 'Unknown'}</div>
          <p className="text-xs text-slate-500">
            {systemInfo.build && `Build ${systemInfo.build}`}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">OS</CardTitle>
          <Server className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 truncate">{systemInfo.os || 'Unknown'}</div>
          {/* <p className="text-xs text-slate-500">Operating System</p> */}
          
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
          <Briefcase className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-slate-900">{agentsCount}</div>
            <span className="text-slate-500">agents</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-lg font-semibold text-slate-900">{jobsCount}</div>
            <span className="text-slate-500">jobs</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
