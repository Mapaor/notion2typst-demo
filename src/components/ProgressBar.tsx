import React from 'react';

interface ProgressBarProps {
  message: string;
  loading: boolean;
}

export default function ProgressBar({ message, loading }: ProgressBarProps) {
  return (
    <div className="w-full mt-6">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-green-700">{message}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-4 rounded-full ${loading ? 'bg-green-500 animate-pulse' : 'bg-green-400'} w-full`}
        ></div>
      </div>
      {loading && (
        <div className="text-xs text-gray-500 mt-2 text-center animate-pulse">{message}</div>
      )}
    </div>
  );
}
