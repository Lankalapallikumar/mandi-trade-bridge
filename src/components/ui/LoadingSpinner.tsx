'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-secondary-200 border-t-secondary-600',
    white: 'border-white/30 border-t-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-3 border-solid rounded-full animate-spin
        `}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && (
        <p className="mt-2 text-sm text-neutral-600 animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
}

// Skeleton loading components
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-neutral-200 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-6 bg-neutral-300 rounded-lg mb-2 w-3/4"></div>
            <div className="h-4 bg-neutral-300 rounded-lg mb-2 w-1/2"></div>
            <div className="h-4 bg-neutral-300 rounded-lg w-2/3"></div>
          </div>
          <div className="text-right">
            <div className="h-8 bg-neutral-300 rounded-lg w-20 mb-1"></div>
            <div className="h-3 bg-neutral-300 rounded-lg w-12"></div>
          </div>
        </div>
        <div className="h-4 bg-neutral-300 rounded-lg mb-4 w-full"></div>
        <div className="h-4 bg-neutral-300 rounded-lg mb-6 w-4/5"></div>
        <div className="h-12 bg-neutral-300 rounded-lg w-full"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={`h-4 bg-neutral-200 rounded-lg ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}