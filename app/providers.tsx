// app/providers.tsx
'use client'; // This directive is essential for client-side components in Next.js App Router

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures that QueryClient is only created once per component instance,
  // preventing issues with re-renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            // Other default query options can go here
            // refetchOnWindowFocus: false, // Example: disable refetch on window focus
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* The React Query Devtools are super useful for debugging */}
      {/* Only include them in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
