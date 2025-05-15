/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating a ticket
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export async function GET(request: NextRequest) {
  // Simulate network delay to observe TanStack Query's loading states
  // In a real app, you wouldn't add an artificial delay here.
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tickets', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { title, description, priority } = validation.data;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description: description || null, // Handle optional description
        priority: priority || 'MEDIUM', // Default priority if not provided
        status: 'OPEN', // Default status
      },
    });
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json(
      { message: 'Failed to create ticket', error: (error as Error).message },
      { status: 500 }
    );
  }
}
