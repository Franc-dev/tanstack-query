// components/CustomLoaders.tsx
'use client';

import React from 'react';

export default function CustomLoaders() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-xl border border-orange-200 mt-8">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Custom Loaders Library</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loader 1: Spinning Circle */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Spinning Circle</h3>
          <div className="h-16 w-16 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">Primary loading animation</p>
        </div>
        
        {/* Loader 2: Dual Spinning Circles */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dual Spinning</h3>
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
              <div className="h-16 w-16 border-8 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
              <div className="h-8 w-8 border-4 border-orange-500 border-t-orange-200 rounded-full animate-spin-slow"></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Advanced loading animation</p>
        </div>
        
        {/* Loader 3: Bouncing Dots */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Bouncing Dots</h3>
          <div className="flex space-x-2 loading-dots">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Subtle loading indicator</p>
        </div>
        
        {/* Loader 4: Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Progress Bar</h3>
          <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full animate-pulse-soft" style={{ width: '75%' }}></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Process indicator</p>
        </div>
        
        {/* Loader 5: Circular Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Circular Progress</h3>
          <div className="relative h-16 w-16">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-orange-100" 
                strokeWidth="10"
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className="text-orange-500 animate-pulse-soft" 
                strokeWidth="10" 
                strokeDasharray="251" 
                strokeDashoffset="100" 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
            </svg>
          </div>
          <p className="mt-4 text-sm text-gray-500">Circular completion indicator</p>
        </div>
        
        {/* Loader 6: Inline Spinner */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-orange-100 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Inline Spinner</h3>
          <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
            <div className="w-4 h-4 mr-2 relative">
              <div className="absolute w-full h-full border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            Loading...
          </div>
          <p className="mt-4 text-sm text-gray-500">For button or text loading states</p>
        </div>
      </div>
    </div>
  );
}