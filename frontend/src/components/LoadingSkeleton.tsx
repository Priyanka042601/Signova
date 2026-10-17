import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-2xl skeleton-shimmer flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2.5 mt-6">
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-4/5" />
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Hero Banner Skeleton */}
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
      <div className="w-16 h-16 rounded-2xl skeleton-shimmer flex-shrink-0" />
      <div className="space-y-3 flex-1 w-full">
        <SkeletonBox className="h-6 w-2/3 md:w-1/3" />
        <SkeletonBox className="h-4 w-full md:w-3/4" />
      </div>
      <div className="w-full md:w-36 h-12 rounded-2xl skeleton-shimmer flex-shrink-0" />
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-24" />
            <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
          </div>
          <SkeletonBox className="h-7 w-16" />
          <SkeletonBox className="h-3 w-32" />
        </div>
      ))}
    </div>

    {/* Curriculum Preview Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <SkeletonCard className="h-64" />
      </div>
      <div className="space-y-4">
        <SkeletonCard className="h-64" />
      </div>
    </div>
  </div>
);

export const SkeletonSignCard: React.FC = () => (
  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
    <div className="w-full h-36 rounded-2xl skeleton-shimmer" />
    <div className="space-y-2">
      <SkeletonBox className="h-5 w-3/4" />
      <SkeletonBox className="h-3 w-1/3" />
    </div>
    <div className="pt-2 flex justify-between items-center">
      <SkeletonBox className="h-6 w-20 rounded-full" />
      <SkeletonBox className="h-6 w-6 rounded-full" />
    </div>
  </div>
);
