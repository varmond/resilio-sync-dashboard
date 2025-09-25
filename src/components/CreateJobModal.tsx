'use client';

import { useState } from 'react';
import { ResilioAgent, CreateJobRequest } from '@/types/resilio';
import { useCreateJob } from '@/hooks/useResilioAPI';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle } from 'lucide-react';

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
    sourcePath: '',
    destinationPath: '',
    agentId: '',
    options: {
      recursive: true,
      deleteSource: false,
      overwrite: false,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Job name is required';
    }

    if (!formData.sourcePath.trim()) {
      newErrors.sourcePath = 'Source path is required';
    }

    if (!formData.destinationPath.trim()) {
      newErrors.destinationPath = 'Destination path is required';
    }

    if (!formData.agentId) {
      newErrors.agentId = 'Please select an agent';
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
        sourcePath: '',
        destinationPath: '',
        agentId: '',
        options: {
          recursive: true,
          deleteSource: false,
          overwrite: false,
        }
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

  const handleOptionChange = (option: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            Create New Job
          </DialogTitle>
          <DialogDescription>
            Configure a new sync, backup, archive, or transfer job to run on your agents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Name */}
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

          {/* Job Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Job Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sync">Sync - Keep folders synchronized</SelectItem>
                <SelectItem value="backup">Backup - Create backup copies</SelectItem>
                <SelectItem value="archive">Archive - Move files to archive</SelectItem>
                <SelectItem value="transfer">Transfer - One-time file transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agentId">Target Agent *</Label>
            <Select value={formData.agentId} onValueChange={(value) => handleInputChange('agentId', value)}>
              <SelectTrigger className={errors.agentId ? 'border-red-300' : ''}>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <span>{agent.name}</span>
                      <span className="text-xs text-slate-500">
                        ({agent.status}) - {agent.ip}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.agentId && (
              <p className="text-sm text-red-600">{errors.agentId}</p>
            )}
          </div>

          {/* Source Path */}
          <div className="space-y-2">
            <Label htmlFor="sourcePath">Source Path *</Label>
            <Input
              id="sourcePath"
              value={formData.sourcePath}
              onChange={(e) => handleInputChange('sourcePath', e.target.value)}
              placeholder="e.g., /Users/username/Documents"
              className={errors.sourcePath ? 'border-red-300' : ''}
            />
            {errors.sourcePath && (
              <p className="text-sm text-red-600">{errors.sourcePath}</p>
            )}
          </div>

          {/* Destination Path */}
          <div className="space-y-2">
            <Label htmlFor="destinationPath">Destination Path *</Label>
            <Input
              id="destinationPath"
              value={formData.destinationPath}
              onChange={(e) => handleInputChange('destinationPath', e.target.value)}
              placeholder="e.g., /backup/documents"
              className={errors.destinationPath ? 'border-red-300' : ''}
            />
            {errors.destinationPath && (
              <p className="text-sm text-red-600">{errors.destinationPath}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recursive"
                  checked={formData.options?.recursive || false}
                  onCheckedChange={(checked) => handleOptionChange('recursive', checked as boolean)}
                />
                <Label htmlFor="recursive" className="text-sm font-normal">
                  Include subdirectories (recursive)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite"
                  checked={formData.options?.overwrite || false}
                  onCheckedChange={(checked) => handleOptionChange('overwrite', checked as boolean)}
                />
                <Label htmlFor="overwrite" className="text-sm font-normal">
                  Overwrite existing files
                </Label>
              </div>
              
              {formData.type === 'archive' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deleteSource"
                    checked={formData.options?.deleteSource || false}
                    onCheckedChange={(checked) => handleOptionChange('deleteSource', checked as boolean)}
                  />
                  <Label htmlFor="deleteSource" className="text-sm font-normal">
                    Delete source files after archiving
                  </Label>
                </div>
              )}
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
