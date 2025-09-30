import { NextRequest, NextResponse } from 'next/server';
import { ResilioJob } from '@/types/resilio';

const RESILIO_BASE_URL = process.env.NEXT_PUBLIC_RESILIO_API_BASE_URL;
const API_TOKEN = process.env.RESILIO_API_TOKEN;
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Mock jobs storage (in a real app, this would be in a database)
let mockJobs: ResilioJob[] = [
  {
    id: 'job-1',
    name: 'Daily Backup',
    type: 'backup',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 1800000),
    sourcePath: '/Users/nick/Documents',
    destinationPath: '/backup/documents',
    agentId: 'agent-1',
    agentName: 'Main Server',
    filesProcessed: 1250,
    totalFiles: 1920,
    bytesTransferred: 1024000000,
    totalBytes: 1572864000
  },
  {
    id: 'job-2',
    name: 'Photo Sync',
    type: 'sync',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 7200000),
    endTime: new Date(Date.now() - 3600000),
    sourcePath: '/Users/nick/Pictures',
    destinationPath: '/shared/photos',
    agentId: 'agent-2',
    agentName: 'Backup Server',
    filesProcessed: 450,
    totalFiles: 450,
    bytesTransferred: 2048000000,
    totalBytes: 2048000000
  },
  {
    id: 'job-3',
    name: 'Archive Transfer',
    type: 'archive',
    status: 'failed',
    progress: 30,
    startTime: new Date(Date.now() - 900000),
    endTime: new Date(Date.now() - 600000),
    sourcePath: '/Users/nick/Archive',
    destinationPath: '/archive/old-files',
    agentId: 'agent-1',
    agentName: 'Main Server',
    filesProcessed: 150,
    totalFiles: 500,
    bytesTransferred: 512000000,
    totalBytes: 1700000000,
    errorMessage: 'Connection timeout to destination server'
  },
  {
    id: 'job-4',
    name: 'Weekly Transfer',
    type: 'transfer',
    status: 'queued',
    progress: 0,
    startTime: new Date(),
    sourcePath: '/Users/nick/Downloads',
    destinationPath: '/shared/downloads',
    agentId: 'agent-2',
    agentName: 'Backup Server',
    filesProcessed: 0,
    totalFiles: 75,
    bytesTransferred: 0,
    totalBytes: 256000000
  }
];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    if (MOCK_MODE) {
      const jobIndex = mockJobs.findIndex(job => job.id === jobId);
      
      if (jobIndex === -1) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      
      const deletedJob = mockJobs.splice(jobIndex, 1)[0];
      
      return NextResponse.json({
        data: { job: deletedJob },
        method: 'DELETE',
        path: `/api/v2/jobs/${jobId}`,
        status: 200
      });
    }

    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle cases where the API returns empty response or non-JSON content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If the response is not JSON, return a success response
      return NextResponse.json({
        data: { id: jobId, deleted: true },
        method: 'DELETE',
        path: `/api/v2/jobs/${jobId}`,
        status: 200
      });
    }

    // Try to parse JSON, but handle cases where it might be empty
    let data;
    try {
      const text = await response.text();
      if (text.trim() === '') {
        // Empty response - return success
        data = { id: jobId, deleted: true };
      } else {
        data = JSON.parse(text);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, treating as success:', parseError);
      data = { id: jobId, deleted: true };
    }

    return NextResponse.json({
      data,
      method: 'DELETE',
      path: `/api/v2/jobs/${jobId}`,
      status: 200
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
