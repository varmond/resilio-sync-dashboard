'use client';

import { useState } from 'react';
import { ResilioAgent, CreateJobRequest, JobGroup, JobAgent } from '@/types/resilio';
import { useCreateJob } from '@/hooks/useResilioAPI';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle, X, Trash2 } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: ResilioAgent[];
}

export function CreateJobModal({ isOpen, onClose, agents }: CreateJobModalProps) {
  const createJobMutation = useCreateJob();
  
  // Debug: Log agents data
  // console.log('CreateJobModal received agents:', agents);
  const [formData, setFormData] = useState<CreateJobRequest>({
    name: '',
    type: 'sync',
    description: '',
    groups: [],
    agents: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [groupPath, setGroupPath] = useState({ linux: '', win: '', osx: '' });
  const [agentPath, setAgentPath] = useState({ linux: '', win: '', osx: '' });

  // Mock groups data - in a real app, this would come from an API
  const availableGroups = [
    { id: 1, name: 'Production Servers', path: '/data/production' },
    { id: 2, name: 'Backup Storage', path: '/backup' },
    { id: 3, name: 'Development', path: '/dev' },
    { id: 4, name: 'Archive', path: '/archive' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Job name is required';
    }

    // Groups are optional - no validation needed

    if (formData.agents.length === 0) {
      newErrors.agents = 'At least one agent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createJobMutation.mutateAsync(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        type: 'sync',
        description: '',
        groups: [],
        agents: [],
      });
      setErrors({});
      setGroupPath({ linux: '', win: '', osx: '' });
      setAgentPath({ linux: '', win: '', osx: '' });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addGroup = () => {
    if (selectedGroupId) {
      const group = availableGroups.find(g => g.id.toString() === selectedGroupId);
      if (group) {
        const jobGroup: JobGroup = {
          id: group.id,
          permission: 'rw',
          path: {
            linux: groupPath.linux || group.path,
            win: groupPath.win || group.path.replace(/\//g, '\\'),
            osx: groupPath.osx || group.path,
          }
        };
        
        setFormData(prev => ({
          ...prev,
          groups: [...prev.groups, jobGroup]
        }));
        
        setSelectedGroupId('');
        setGroupPath({ linux: '', win: '', osx: '' });
      }
    }
  };

  const removeGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  const addAgent = () => {
    if (selectedAgentId) {
      const agent = agents.find(a => a.id.toString() === selectedAgentId);
      
      if (agent) {
        // Convert ID to number for JobAgent (handle both string and number IDs)
        const numericId = typeof agent.id === 'number' ? agent.id : parseInt(agent.id.toString());
        
        const jobAgent: JobAgent = {
          id: numericId,
          permission: 'ro',
          path: {
            linux: agentPath.linux || '/path/to/agent/data',
            win: agentPath.win || 'C:\\path\\to\\agent\\data',
            osx: agentPath.osx || '/path/to/agent/data',
          }
        };
        
        setFormData(prev => ({
          ...prev,
          agents: [...prev.agents, jobAgent]
        }));
        
        setSelectedAgentId('');
        setAgentPath({ linux: '', win: '', osx: '' });
      }
    }
  };

  const removeAgent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            Create New Job
          </DialogTitle>
          <DialogDescription>
            Configure a new Resilio Sync job by selecting existing groups and agents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Job Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Daily Backup, Photo Sync"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Job Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sync">Sync - Keep folders synchronized</SelectItem>
                    <SelectItem value="distribution">Distribution - Distribute files to agents</SelectItem>
                    <SelectItem value="consolidation">Consolidation - Consolidate files from agents</SelectItem>
                    <SelectItem value="script">Script - Run custom scripts</SelectItem>
                    <SelectItem value="file_caching">File Caching - Cache files for performance</SelectItem>
                    <SelectItem value="hybrid_work">Hybrid Work - Hybrid work scenarios</SelectItem>
                    <SelectItem value="storage_tiering_and_archival">Storage Tiering - Archive old files</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional job description"
                rows={3}
              />
            </div>
          </div>

          {/* Groups Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Select Groups (Optional)</h3>

            {/* Add Group */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a group to add (optional)">
                      {selectedGroupId && availableGroups.find(g => g.id.toString() === selectedGroupId)
                        ? `${availableGroups.find(g => g.id.toString() === selectedGroupId)?.name} - ${availableGroups.find(g => g.id.toString() === selectedGroupId)?.path}`
                        : "Select a group to add (optional)"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name} - {group.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addGroup} disabled={!selectedGroupId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Group Path Inputs */}
              {selectedGroupId && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Group Path Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="group-linux" className="text-xs">Linux Path</Label>
                      <Input
                        id="group-linux"
                        value={groupPath.linux}
                        onChange={(e) => setGroupPath(prev => ({ ...prev, linux: e.target.value }))}
                        placeholder="/path/to/linux"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="group-win" className="text-xs">Windows Path</Label>
                      <Input
                        id="group-win"
                        value={groupPath.win}
                        onChange={(e) => setGroupPath(prev => ({ ...prev, win: e.target.value }))}
                        placeholder="C:\\path\\to\\windows"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="group-osx" className="text-xs">macOS Path</Label>
                      <Input
                        id="group-osx"
                        value={groupPath.osx}
                        onChange={(e) => setGroupPath(prev => ({ ...prev, osx: e.target.value }))}
                        placeholder="/path/to/macos"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Groups */}
            {formData.groups.map((group, index) => {
              const groupInfo = availableGroups.find(g => g.id === group.id);
              return (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900">{groupInfo?.name}</div>
                    <div className="text-sm text-slate-600">
                      Linux: {group.path.linux} | Win: {group.path.win} | macOS: {group.path.osx}
                    </div>
                    <div className="text-xs text-slate-500">Permission: {group.permission}</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGroup(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Agents Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Select Agents</h3>
            
            {errors.agents && (
              <p className="text-sm text-red-600">{errors.agents}</p>
            )}

            {/* Add Agent */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an agent to add">
                      {selectedAgentId && agents.find(a => a.id.toString() === selectedAgentId) 
                        ? `${agents.find(a => a.id.toString() === selectedAgentId)?.name} (${agents.find(a => a.id.toString() === selectedAgentId)?.status}) - ${agents.find(a => a.id.toString() === selectedAgentId)?.ip}`
                        : "Select an agent to add"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name} ({agent.status}) - {agent.ip}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addAgent} disabled={!selectedAgentId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Agent Path Inputs */}
              {selectedAgentId && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Agent Path Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="agent-linux" className="text-xs">Linux Path</Label>
                      <Input
                        id="agent-linux"
                        value={agentPath.linux}
                        onChange={(e) => setAgentPath(prev => ({ ...prev, linux: e.target.value }))}
                        placeholder="/path/to/linux"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="agent-win" className="text-xs">Windows Path</Label>
                      <Input
                        id="agent-win"
                        value={agentPath.win}
                        onChange={(e) => setAgentPath(prev => ({ ...prev, win: e.target.value }))}
                        placeholder="C:\\path\\to\\windows"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="agent-osx" className="text-xs">macOS Path</Label>
                      <Input
                        id="agent-osx"
                        value={agentPath.osx}
                        onChange={(e) => setAgentPath(prev => ({ ...prev, osx: e.target.value }))}
                        placeholder="/path/to/macos"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Agents */}
            {formData.agents.map((agent, index) => {
              const agentInfo = agents.find(a => {
                const agentId = typeof a.id === 'number' ? a.id : parseInt(a.id.toString());
                return agentId === agent.id;
              });
              return (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium text-slate-900">{agentInfo?.name || `Agent ${agent.id}`}</div>
                    <div className="text-sm text-slate-600">
                      Linux: {agent.path.linux} | Win: {agent.path.win} | macOS: {agent.path.osx}
                    </div>
                    <div className="text-xs text-slate-500">Permission: {agent.permission}</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAgent(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Error Alert */}
          {createJobMutation.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Failed to create job. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createJobMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createJobMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}