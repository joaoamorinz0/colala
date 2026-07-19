'use client';

import { AlertCircle } from 'lucide-react';

interface InfoCardProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export function InfoCard({ title, message, type = 'info' }: InfoCardProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  };

  const iconColor = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    success: 'text-green-600',
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <AlertCircle className={`mt-0.5 flex-shrink-0 ${iconColor[type]}`} size={20} />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
