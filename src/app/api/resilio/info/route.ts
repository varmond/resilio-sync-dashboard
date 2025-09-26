import { NextRequest, NextResponse } from 'next/server';
import { ResilioSystemInfo } from '@/types/resilio';

const RESILIO_BASE_URL = process.env.NEXT_PUBLIC_RESILIO_API_BASE_URL;
const API_TOKEN = process.env.RESILIO_API_TOKEN;
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Mock data for development
const mockSystemInfo: ResilioSystemInfo = {
  version: '2.7.3',
  os: 'macOS 14.6.0',
  build: '2024.09.15',
  uptime: 86400, // 24 hours in seconds
  totalAgents: 3,
  activeJobs: 2
};

export async function GET() {
  try {
    if (MOCK_MODE) {
      return NextResponse.json({
        data: mockSystemInfo,
        method: 'GET',
        path: '/api/v2/info',
        status: 200
      });
    }

    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/info`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      agent: new (require('https').Agent)({ rejectUnauthorized: false })
    } as any);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert Unix timestamps to Date objects and process uptime
    const processSystemInfo = (info: any) => {
      return {
        ...info,
        // If uptime is a Unix timestamp, convert it to seconds since epoch
        uptime: info.uptime ? (typeof info.uptime === 'number' && info.uptime > 1000000000 
          ? Math.floor((Date.now() - info.uptime * 1000) / 1000) 
          : info.uptime) : 0,
        // Convert any other timestamp fields
        lastUpdate: info.lastUpdate ? new Date(info.lastUpdate * 1000) : new Date(),
        startTime: info.startTime ? new Date(info.startTime * 1000) : new Date(),
      };
    };
    
    const processedInfo = processSystemInfo(data);
    
    // For info endpoint, return the processed data
    return NextResponse.json({
      data: processedInfo,
      method: 'GET',
      path: '/api/v2/info',
      status: 200
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    
    // Fallback to mock data if API fails
    return NextResponse.json({
      data: mockSystemInfo,
      method: 'GET',
      path: '/api/v2/info',
      status: 200
    });
  }
}
