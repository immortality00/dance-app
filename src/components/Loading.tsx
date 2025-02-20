interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ variant = 'spinner', size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse`}
            style={{ animationDelay: `${(dot - 1) * 0.15}s` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full rounded-full bg-primary/30 animate-ping" />
      </div>
    );
  }

  // Default spinner
  return (
    <div
      className={`${sizeClasses[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin ${className}`}
    />
  );
} 