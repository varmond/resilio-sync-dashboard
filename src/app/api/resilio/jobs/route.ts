import { NextRequest, NextResponse } from 'next/server';
import { ResilioJob, CreateJobRequest } from '@/types/resilio';

const RESILIO_BASE_URL = process.env.NEXT_PUBLIC_RESILIO_API_BASE_URL;
const API_TOKEN = process.env.RESILIO_API_TOKEN;
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Mock data for development
let mockJobs: ResilioJob[] = [
  {
    id: 'job-1',
    name: 'Daily Backup',
    type: 'backup',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 1800000), // 30 minutes ago
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
    startTime: new Date(Date.now() - 7200000), // 2 hours ago
    endTime: new Date(Date.now() - 3600000), // 1 hour ago
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
    startTime: new Date(Date.now() - 900000), // 15 minutes ago
    endTime: new Date(Date.now() - 600000), // 10 minutes ago
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

export async function GET() {
  try {
    if (MOCK_MODE) {
      return NextResponse.json({
        data: { jobs: mockJobs },
        method: 'GET',
        path: '/api/v2/jobs',
        status: 200
      });
    }

    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/jobs`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert Unix timestamps to Date objects
    const processJobs = (jobs: any[]) => {
      return jobs.map(job => ({
        ...job,
        startTime: job.startTime ? new Date(job.startTime * 1000) : new Date(),
        endTime: job.endTime ? new Date(job.endTime * 1000) : undefined,
        lastUpdate: job.lastUpdate ? new Date(job.lastUpdate * 1000) : new Date(),
      }));
    };
    
    // If the API returns an array directly, wrap it in the expected format
    if (Array.isArray(data)) {
      const processedJobs = processJobs(data);
      return NextResponse.json({
        data: { jobs: processedJobs },
        method: 'GET',
        path: '/api/v2/jobs',
        status: 200
      });
    }
    
    // If the API returns an object with jobs property, process and return
    if (data.jobs && Array.isArray(data.jobs)) {
      const processedJobs = processJobs(data.jobs);
      return NextResponse.json({
        ...data,
        data: { ...data.data, jobs: processedJobs }
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    
    // Fallback to mock data if API fails
    return NextResponse.json({
      data: { jobs: mockJobs },
      method: 'GET',
      path: '/api/v2/jobs',
      status: 200
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateJobRequest = await request.json();
    
    if (MOCK_MODE) {
      const newJob: ResilioJob = {
        id: `job-${Date.now()}`,
        name: body.name,
        type: body.type,
        status: 'queued',
        progress: 0,
        startTime: new Date(),
        sourcePath: body.sourcePath,
        destinationPath: body.destinationPath,
        agentId: body.agentId,
        agentName: 'Mock Agent',
        filesProcessed: 0,
        totalFiles: 0,
        bytesTransferred: 0,
        totalBytes: 0
      };
      
      mockJobs.push(newJob);
      
      return NextResponse.json({
        data: { job: newJob },
        method: 'POST',
        path: '/api/v2/jobs',
        status: 201
      });
    }

    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to get the error details from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error('Resilio API error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        details: errorDetails
      });
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create job',
        details: error
      },
      { status: 500 }
    );
  }
}
