// components/CreateTicketForm.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Priority } from '@prisma/client';

// Define the type for the new ticket payload
interface NewTicketPayload {
  title: string;
  description?: string;
  priority?: Priority;
}

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

async function createTicket(newTicket: NewTicketPayload): Promise<Ticket> {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTicket),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create ticket');
  }
  return response.json();
}

export default function CreateTicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation<Ticket, Error, NewTicketPayload>({
    mutationFn: createTicket,
    onSuccess: (newTicketData) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setError(null);
      console.log('Ticket created successfully:', newTicketData);
    },
    onError: (mutationError: Error) => {
      console.error('Error creating ticket:', mutationError);
      setError(mutationError.message || 'An unexpected error occurred.');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    setError(null);
    mutation.mutate({ title, description, priority });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-xl border border-orange-200 space-y-4">
      <h2 className="text-2xl font-semibold text-orange-600 mb-4">Create New Ticket</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-orange-800 bg-orange-100 border border-orange-300 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}
      {mutation.isError && !error && (
         <div className="p-3 mb-4 text-sm text-orange-800 bg-orange-100 border border-orange-300 rounded-md">
          <strong>Error creating ticket:</strong> {(mutation.error as Error)?.message || "An unknown error occurred."}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-white text-gray-800 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
          placeholder="Enter ticket title"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-3 bg-white text-gray-800 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
          placeholder="Provide more details about the issue"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full p-3 bg-white text-gray-800 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full px-4 py-3 font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {mutation.isPending ? (
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 border-4 border-white border-t-orange-500 rounded-full animate-spin mr-2"></div>
            Creating Ticket...
          </div>
        ) : 'Create Ticket'}
      </button>
    </form>
  );
}