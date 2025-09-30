'use client';

import { useResilioAgents, useResilioJobs, useResilioSystemInfo } from '@/hooks/useResilioAPI';
import { AgentCard } from './AgentCard';
import { JobsTable } from './JobsTable';
import { SystemStatus } from './SystemStatus';
import { CreateJobModal } from './CreateJobModal';
import { RefreshCw, AlertCircle, Plus, Server, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export function Dashboard() {
  const { data: agentsData, isLoading: agentsLoading, error: agentsError, refetch: refetchAgents } = useResilioAgents();
  const { data: jobsData, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useResilioJobs();
  const { data: systemInfo, isLoading: systemLoading } = useResilioSystemInfo();
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  const isLoading = agentsLoading || jobsLoading || systemLoading;
  const hasError = agentsError || jobsError;

  const agents = agentsData?.data?.agents || [];
  const jobs = jobsData?.data?.jobs || [];
  const systemInfoData = systemInfo?.data;

  const handleRefresh = () => {
    refetchAgents();
    refetchJobs();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">Error loading dashboard data</p>
          <Button onClick={handleRefresh} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {process.env.NEXT_PUBLIC_DASHBOARD_TITLE || 'Resilio Sync Dashboard'}
              </h1>
              <p className="text-slate-600 text-lg">Monitor your sync agents and jobs</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setIsCreateJobModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </div>
          </div>
          <SystemStatus systemInfo={systemInfoData} agentsCount={agents.length} jobsCount={jobs.length} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({jobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            {agents.length === 0 && (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Server className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Agents Found</h3>
                  <p className="text-slate-600 text-center">
                    No sync agents are currently connected. Make sure your Resilio Sync instances are running and accessible.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobsTable jobs={jobs} />
            {jobs.length === 0 && (
              <Card className="border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Jobs Found</h3>
                  <p className="text-slate-600 text-center mb-4">
                    No sync jobs are currently configured. Create your first job to get started.
                  </p>
                  <Button 
                    onClick={() => setIsCreateJobModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateJobModal 
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        agents={agents}
      />
    </div>
  );
}
