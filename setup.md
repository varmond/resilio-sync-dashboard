# Next.js Resilio Sync Dashboard Setup Guide

## Prerequisites

Before getting started, ensure you have:
- **Node.js 18+** installed on your machine
- **Resilio Sync** running locally with API access enabled
- A valid **Resilio Sync API token** (generated from Sync settings)

## Step 1: Project Setup

### 1.1 Create a new Next.js project
```bash
npx create-next-app@latest resilio-sync-dashboard
cd resilio-sync-dashboard
```

When prompted, choose:
- ✅ TypeScript
- ✅ ESLint  
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Turbopack (optional)

### 1.2 Install shadcn/ui and dependencies
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required shadcn components
npx shadcn-ui@latest add card button badge progress alert separator
npx shadcn-ui@latest add tooltip dialog sheet tabs

# Install additional dependencies
npm install @tanstack/react-query lucide-react date-fns
npm install -D @types/node
```

**When initializing shadcn/ui, choose:**
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ Import alias: `@/*`

## Step 2: Environment Configuration

### 2.1 Create environment file
Create a `.env.local` file in your project root:

```env
# Resilio Sync API Configuration
NEXT_PUBLIC_RESILIO_API_BASE_URL=http://localhost:8888
RESILIO_API_TOKEN=your_api_token_here
RESILIO_API_USERNAME=your_username
RESILIO_API_PASSWORD=your_password

# Optional: Dashboard Configuration
NEXT_PUBLIC_DASHBOARD_TITLE="My Resilio Sync Dashboard"
NEXT_PUBLIC_REFRESH_INTERVAL=30000
```

### 2.2 Add to .gitignore
Ensure your `.gitignore` includes:
```gitignore
.env.local
.env
```

## Step 3: API Route Setup

### 3.1 Create API proxy routes
Create the following API routes to proxy requests to your Resilio Sync API:

**File: `src/app/api/resilio/folders/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const RESILIO_BASE_URL = process.env.NEXT_PUBLIC_RESILIO_API_BASE_URL;
const API_TOKEN = process.env.RESILIO_API_TOKEN;

export async function GET() {
  try {
    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/folders`, {
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
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}
```

**File: `src/app/api/resilio/info/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const RESILIO_BASE_URL = process.env.NEXT_PUBLIC_RESILIO_API_BASE_URL;
const API_TOKEN = process.env.RESILIO_API_TOKEN;

export async function GET() {
  try {
    const response = await fetch(`${RESILIO_BASE_URL}/api/v2/info`, {
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
    console.error('Error fetching system info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system info' },
      { status: 500 }
    );
  }
}
```

## Step 4: TypeScript Types

### 4.1 Create type definitions
**File: `src/types/resilio.ts`**
```typescript
export interface ResilioFolder {
  id: string;
  name: string;
  path: string;
  paused: boolean;
  stopped: boolean;
  synclevel: number;
  synclevelname: string;
  iswritable: boolean;
  ismanaged: boolean;
  deletetotrash: boolean;
  relay: boolean;
  searchlan: boolean;
  searchdht: boolean;
  usetracker: boolean;
  usehosts: boolean;
  date_added: number;
  shareid: string;
}

export interface ResilioSystemInfo {
  version: string;
  os: string;
  build?: string;
}

export interface ResilioAPIResponse<T> {
  data: T;
  method: string;
  path: string;
  status: number;
}

export interface SyncStatus {
  id: string;
  name: string;
  status: 'synced' | 'syncing' | 'paused' | 'error';
  progress: number;
  lastSync: Date;
  peers: number;
}
```

## Step 5: API Hooks

### 5.1 Create React Query hooks
**File: `src/hooks/useResilioAPI.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { ResilioFolder, ResilioSystemInfo, ResilioAPIResponse } from '@/types/resilio';

export const useResilioFolders = () => {
  return useQuery<ResilioAPIResponse<{ folders: ResilioFolder[] }>>({
    queryKey: ['resilio', 'folders'],
    queryFn: async () => {
      const response = await fetch('/api/resilio/folders');
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useResilioSystemInfo = () => {
  return useQuery<ResilioSystemInfo>({
    queryKey: ['resilio', 'info'],
    queryFn: async () => {
      const response = await fetch('/api/resilio/info');
      if (!response.ok) {
        throw new Error('Failed to fetch system info');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
```

## Step 6: Dashboard Components

### 6.1 Create the main dashboard layout
**File: `src/components/Dashboard.tsx`**
```typescript
'use client';

import { useResilioFolders, useResilioSystemInfo } from '@/hooks/useResilioAPI';
import { FolderCard } from './FolderCard';
import { SystemStatus } from './SystemStatus';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function Dashboard() {
  const { data: foldersData, isLoading: foldersLoading, error: foldersError, refetch } = useResilioFolders();
  const { data: systemInfo, isLoading: systemLoading } = useResilioSystemInfo();

  if (foldersLoading || systemLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (foldersError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Error loading dashboard data</span>
      </div>
    );
  }

  const folders = foldersData?.data?.folders || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {process.env.NEXT_PUBLIC_DASHBOARD_TITLE || 'Resilio Sync Dashboard'}
        </h1>
        <SystemStatus systemInfo={systemInfo} />
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sync Folders ({folders.length})</h2>
        <button
          onClick={() => refetch()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No sync folders found. Add some folders in your Resilio Sync application.
        </div>
      )}
    </div>
  );
}
```

## Step 7: Getting Your API Token

### 7.1 Enable API in Resilio Sync
1. Open Resilio Sync on your local machine
2. Go to **Preferences/Settings**
3. Navigate to **Advanced** or **API** section
4. Enable **Use API**
5. Set a **username** and **password** for API access
6. Note the **API port** (usually 8888)

### 7.2 Test API access
Run this curl command to verify your setup:
```bash
curl -u username:password http://localhost:8888/api/v2/folders
```

## Step 8: Run the Dashboard

### 8.1 Start the development server
```bash
npm run dev
```

### 8.2 Open in browser
Navigate to `http://localhost:3000` to see your dashboard.

## Key Features Included

✅ **Real-time folder monitoring** - Shows sync status of all folders  
✅ **System health info** - Displays Resilio Sync version and OS  
✅ **Auto-refresh** - Updates data every 30 seconds  
✅ **Responsive design** - Works on desktop and mobile  
✅ **Error handling** - Graceful handling of API failures  
✅ **Environment configuration** - Secure API token management  

## Next Steps

To extend your dashboard, consider adding:
- **Peer information** for each folder
- **Transfer speed monitoring** 
- **Sync history and logs**
- **Notification system** for sync issues
- **Dark mode toggle**
- **Folder management** (pause/resume sync)

## Troubleshooting

**Common issues:**
- **API not accessible**: Ensure Resilio Sync is running and API is enabled
- **CORS errors**: The API proxy routes should handle this
- **Authentication errors**: Verify your username/password in `.env.local`
- **Port conflicts**: Check if port 8888 is the correct API port

For more advanced features, refer to the [official Resilio API documentation](https://www.resilio.com/api/connect/documentation/) and the community-created [sync_api_sample on GitHub](https://github.com/bt-sync/sync_api_sample).
