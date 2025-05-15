// components/TicketList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';

// Define the expected shape of a Ticket (align with your Prisma model)
interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

// Function to fetch tickets from our API
async function fetchTickets(): Promise<Ticket[]> {
  const response = await fetch('/api/tickets');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch tickets');
  }
  return response.json();
}

export default function TicketList() {
  const { data: tickets, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  }) as { data: Ticket[] | undefined, isLoading: boolean, isError: boolean, error: Error | null, isFetching: boolean, refetch: () => void };

  if (isLoading) {
    return (
      <div className="text-center py-16 bg-white">
        {/* Custom Orange Loader Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
              <div className="h-16 w-16 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
              <div className="h-8 w-8 border-4 border-orange-500 border-t-orange-200 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xl text-orange-600 font-semibold">Loading tickets...</p>
        <p className="text-sm text-gray-500">Fetching initial data from the server.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-orange-50 border border-orange-300 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-orange-600">Error Loading Tickets</h3>
        <p className="text-orange-700 mb-4">{(error as Error)?.message || 'An unknown error occurred.'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-10 bg-white border border-orange-200 rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <p className="text-xl text-orange-600 font-medium">No tickets found.</p>
        <p className="text-sm text-gray-500">Try creating a new ticket to get started!</p>
        {isFetching && (
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
              <div className="w-3 h-3 mr-2 relative">
                <div className="absolute w-full h-full border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              Checking for updates...
            </div>
          </div>
        )}
      </div>
    );
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-orange-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'OPEN': return 'border-blue-500';
      case 'IN_PROGRESS': return 'border-orange-500';
      case 'CLOSED': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-orange-600">Support Tickets</h2>
        <div className="flex items-center space-x-3">
          {isFetching && (
            <div className="flex items-center text-sm text-orange-500">
              <div className="relative h-5 w-5 mr-2">
                <div className="absolute inset-0 border-t-2 border-r-2 border-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-1 border-t-2 border-orange-300 rounded-full animate-spin-slow"></div>
              </div>
              <span>Updating...</span>
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors disabled:opacity-70"
          >
            {isFetching ? 'Refreshing...' : 'Refresh Tickets'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket: Ticket) => (
          <div
            key={ticket.id}
            className={`bg-white shadow-lg rounded-xl p-6 border-l-4 ${getStatusClass(ticket.status)} hover:shadow-orange-200 transition-all duration-300 ease-in-out transform hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800">{ticket.title}</h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityClass(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Status: <span className="font-medium">{ticket.status.replace('_', ' ')}</span></p>
            {ticket.description && (
              <p className="text-gray-700 mt-2 mb-4 text-sm leading-relaxed">{ticket.description}</p>
            )}
            <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
              <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
              <p>Last Updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-white rounded-lg shadow border border-orange-200">
        <h4 className="text-lg font-semibold text-orange-600 mb-2">TanStack Query Performance Notes:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li><span className="font-semibold text-orange-500">Loading State:</span> Initial data fetch shows a prominent custom loading animation.</li>
          <li><span className="font-semibold text-orange-500">Fetching Indicator:</span> Subsequent background refetches show a subtle &quot;Updating...&quot; with custom spinner without hiding existing data.</li>
          <li><span className="font-semibold text-orange-500">Caching:</span> Data is cached. If you navigate away and back, data would load instantly from cache.</li>
          <li><span className="font-semibold text-orange-500">Stale-While-Revalidate:</span> If staleTime is configured, cached data is shown immediately while fresh data is fetched in the background.</li>
          <li><span className="font-semibold text-orange-500">Devtools:</span> Use the React Query Devtools (bottom left icon in dev mode) to inspect query states, cached data, and query timings.</li>
        </ul>
      </div>
    </div>
  );
}