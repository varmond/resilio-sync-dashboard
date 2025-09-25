import { NextRequest, NextResponse } from 'next/server';
import { ResilioAgent } from '@/types/resilio';

const RESILIO_BASE_URL = process.env.NEXT_PUBLIC_RESILIO_API_BASE_URL;
const API_TOKEN = process.env.RESILIO_API_TOKEN;
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Mock data for development
const mockAgents: ResilioAgent[] = [
  {
    id: 'agent-1',
    name: 'Main Server',
    status: 'online',
    lastSeen: new Date(),
    version: '2.7.3',
    os: 'macOS 14.6',
    ip: '192.168.1.100',
    port: 8888,
    isLocal: true,
    folders: 5,
    peers: 12
  },
  {
    id: 'agent-2',
    name: 'Backup Server',
    status: 'online',
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    version: '2.7.2',
    os: 'Ubuntu 22.04',
    ip: '192.168.1.101',
    port: 8888,
    isLocal: false,
    folders: 3,
    peers: 8
  },
  {
    id: 'agent-3',
    name: 'Mobile Device',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    version: '2.7.1',
    os: 'iOS 17.0',
    ip: '192.168.1.102',
    port: 8888,
    isLocal: false,
    folders: 2,
    peers: 0
  }
];

export async function GET() {
  try {
    if (MOCK_MODE) {
      return NextResponse.json({
        data: { agents: mockAgents },
        method: 'GET',
        path: '/api/v2/agents',
        status: 200
      });
    }

    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/agents`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching agents:', error);
    
    // Fallback to mock data if API fails
    return NextResponse.json({
      data: { agents: mockAgents },
      method: 'GET',
      path: '/api/v2/agents',
      status: 200
    });
  }
}
