'use client';

import { useState } from 'react';
import { ResilioAgent, CreateJobRequest, JobGroup, JobAgent, JobPath } from '@/types/resilio';
import { useCreateJob } from '@/hooks/useResilioAPI';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle, X, Trash2 } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: ResilioAgent[];
}

export function CreateJobModal({ isOpen, onClose, agents }: CreateJobModalProps) {
  const createJobMutation = useCreateJob();
  const [formData, setFormData] = useState<CreateJobRequest>({
    name: '',
    type: 'sync',
    description: '',
    groups: [],
    agents: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newGroup, setNewGroup] = useState<Partial<JobGroup>>({
    id: 1,
    permission: 'rw',
    path: { linux: '', win: '', osx: '' }
  });
  const [newAgent, setNewAgent] = useState<Partial<JobAgent>>({
    id: 1,
    permission: 'ro',
    path: { linux: '', win: '', osx: '' }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Job name is required';
    }

    if (formData.groups.length === 0) {
      newErrors.groups = 'At least one group is required';
    }

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
    if (newGroup.id && newGroup.permission && newGroup.path) {
      const group: JobGroup = {
        id: newGroup.id,
        permission: newGroup.permission as 'ro' | 'rw' | 'sro' | 'srw',
        path: newGroup.path as JobPath,
        role: newGroup.role,
        file_policy_id: newGroup.file_policy_id,
        priority_agents: newGroup.priority_agents,
        lock_server: newGroup.lock_server,
      };
      
      setFormData(prev => ({
        ...prev,
        groups: [...prev.groups, group]
      }));
      
      setNewGroup({
        id: (newGroup.id || 0) + 1,
        permission: 'rw',
        path: { linux: '', win: '', osx: '' }
      });
    }
  };

  const removeGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index)
    }));
  };

  const addAgent = () => {
    if (newAgent.id && newAgent.permission && newAgent.path) {
      const agent: JobAgent = {
        id: newAgent.id,
        permission: newAgent.permission as 'ro' | 'rw' | 'sro' | 'srw',
        path: newAgent.path as JobPath,
        storage_config_id: newAgent.storage_config_id,
        role: newAgent.role,
        file_policy_id: newAgent.file_policy_id,
        priority_agents: newAgent.priority_agents,
        lock_server: newAgent.lock_server,
      };
      
      setFormData(prev => ({
        ...prev,
        agents: [...prev.agents, agent]
      }));
      
      setNewAgent({
        id: (newAgent.id || 0) + 1,
        permission: 'ro',
        path: { linux: '', win: '', osx: '' }
      });
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            Create New Job
          </DialogTitle>
          <DialogDescription>
            Configure a new Resilio Sync job with groups and agents.
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Groups</h3>
              <Button type="button" onClick={addGroup} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
            
            {errors.groups && (
              <p className="text-sm text-red-600">{errors.groups}</p>
            )}

            {/* Existing Groups */}
            {formData.groups.map((group, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900">Group {group.id}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGroup(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Permission</Label>
                    <p className="text-sm font-medium">{group.permission}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Role</Label>
                    <p className="text-sm font-medium">{group.role || 'regular'}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Group Form */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-3">Add New Group</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Group ID</Label>
                  <Input
                    type="number"
                    value={newGroup.id || ''}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, id: parseInt(e.target.value) }))}
                    placeholder="Group ID"
                  />
                </div>
                <div>
                  <Label className="text-sm">Permission</Label>
                  <Select value={newGroup.permission} onValueChange={(value) => setNewGroup(prev => ({ ...prev, permission: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">Read Only</SelectItem>
                      <SelectItem value="rw">Read/Write</SelectItem>
                      <SelectItem value="sro">Selective Read Only</SelectItem>
                      <SelectItem value="srw">Selective Read/Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Linux Path</Label>
                  <Input
                    value={newGroup.path?.linux || ''}
                    onChange={(e) => setNewGroup(prev => ({ 
                      ...prev, 
                      path: { ...prev.path, linux: e.target.value } 
                    }))}
                    placeholder="/path/to/linux"
                  />
                </div>
                <div>
                  <Label className="text-sm">Windows Path</Label>
                  <Input
                    value={newGroup.path?.win || ''}
                    onChange={(e) => setNewGroup(prev => ({ 
                      ...prev, 
                      path: { ...prev.path, win: e.target.value } 
                    }))}
                    placeholder="C:\\path\\to\\windows"
                  />
                </div>
                <div>
                  <Label className="text-sm">macOS Path</Label>
                  <Input
                    value={newGroup.path?.osx || ''}
                    onChange={(e) => setNewGroup(prev => ({ 
                      ...prev, 
                      path: { ...prev.path, osx: e.target.value } 
                    }))}
                    placeholder="/path/to/macos"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addGroup} className="w-full">
                    Add Group
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Agents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Agents</h3>
              <Button type="button" onClick={addAgent} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
            
            {errors.agents && (
              <p className="text-sm text-red-600">{errors.agents}</p>
            )}

            {/* Existing Agents */}
            {formData.agents.map((agent, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900">Agent {agent.id}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAgent(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-slate-600">Permission</Label>
                    <p className="text-sm font-medium">{agent.permission}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Role</Label>
                    <p className="text-sm font-medium">{agent.role || 'regular'}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Agent Form */}
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-3">Add New Agent</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Agent ID</Label>
                  <Input
                    type="number"
                    value={newAgent.id || ''}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, id: parseInt(e.target.value) }))}
                    placeholder="Agent ID"
                  />
                </div>
                <div>
                  <Label className="text-sm">Permission</Label>
                  <Select value={newAgent.permission} onValueChange={(value) => setNewAgent(prev => ({ ...prev, permission: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">Read Only</SelectItem>
                      <SelectItem value="rw">Read/Write</SelectItem>
                      <SelectItem value="sro">Selective Read Only</SelectItem>
                      <SelectItem value="srw">Selective Read/Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Linux Path</Label>
                  <Input
                    value={newAgent.path?.linux || ''}
                    onChange={(e) => setNewAgent(prev => ({ 
                      ...prev, 
                      path: { ...prev.path, linux: e.target.value } 
                    }))}
                    placeholder="/path/to/linux"
                  />
                </div>
                <div>
                  <Label className="text-sm">Windows Path</Label>
                  <Input
                    value={newAgent.path?.win || ''}
                    onChange={(e) => setNewAgent(prev => ({ 
                      ...prev, 
                      path: { ...prev.path, win: e.target.value } 
                    }))}
                    placeholder="C:\\path\\to\\windows"
                  />
                </div>
                <div>
                  <Label className="text-sm">macOS Path</Label>
                  <Input
                    value={newAgent.path?.osx || ''}
                    onChange={(e) => setNewAgent(prev => ({ 
                      ...prev, 
                      path: { ...prev.path, osx: e.target.value } 
                    }))}
                    placeholder="/path/to/macos"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addAgent} className="w-full">
                    Add Agent
                  </Button>
                </div>
              </div>
            </div>
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