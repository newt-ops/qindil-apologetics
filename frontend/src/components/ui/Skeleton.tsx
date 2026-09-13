import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rounded' | 'rectangular' | 'button' | 'pill';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  className?: string;
}

/**
 * Base Apple-style Skeleton Loader Primitive
 * Uses hardware-accelerated continuous light-sweep shimmer.
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  animate = true,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full shrink-0';
      case 'rounded':
        return 'rounded-2xl';
      case 'pill':
        return 'rounded-full';
      case 'button':
        return 'h-10 rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'text':
      default:
        return 'h-4 rounded-md';
    }
  };

  const inlineStyles: React.CSSProperties = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60 ${getVariantStyles()} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
}

/**
 * Composite Article Card Skeleton
 * Accurately mirrors ArticleCard.tsx layout & Prompt 42 density rules to eliminate CLS.
 */
export function ArticleCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading publication"
      className={`flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-xl overflow-hidden shadow-apple-card h-full ${className}`}
    >
      {/* Cover Banner Skeleton */}
      <div className="relative h-28 sm:h-48 w-full overflow-hidden bg-stone-200/50 dark:bg-zinc-800/50 border-b border-border/60 skeleton-shimmer shrink-0">
        {/* Topic Badge Skeleton - hidden on mobile */}
        <div className="hidden sm:block absolute top-3 left-3 z-10">
          <div className="h-5 w-20 rounded-full skeleton-shimmer bg-white/70 dark:bg-zinc-900/70" />
        </div>

        {/* Reading Time Badge Skeleton */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <div className="h-4 sm:h-5 w-8 sm:w-16 rounded-full skeleton-shimmer bg-black/30 dark:bg-black/50" />
        </div>
      </div>

      {/* Card Body Skeleton */}
      <div className="flex flex-col flex-1 justify-between p-2.5 sm:p-5 space-y-2 sm:space-y-3">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="h-3.5 sm:h-4 w-11/12 rounded skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80" />
          <div className="h-3.5 sm:h-4 w-3/4 rounded skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80" />

          {/* Excerpt lines on larger viewports */}
          <div className="hidden sm:block space-y-1.5 pt-1.5">
            <div className="h-2.5 w-full rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
            <div className="h-2.5 w-4/5 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
          </div>
        </div>

        {/* Card Footer Skeleton */}
        <div className="pt-2 sm:pt-3 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80 shrink-0" />
            <div className="h-3 sm:h-3.5 w-12 sm:w-20 rounded skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
          </div>

          <div className="h-3 sm:h-3.5 w-4 sm:w-10 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}

/**
 * Composite Article Detail Page Skeleton
 * Matches the reading paper format of ArticleDetailPage.tsx.
 */
export function ArticleDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading article details"
      className="min-h-screen bg-bg text-text font-sans py-8 sm:py-16 selection:bg-gold/20"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-24 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
          <div className="h-4 w-4 rounded skeleton-shimmer bg-stone-200/50 dark:bg-zinc-800/50" />
          <div className="h-4 w-36 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
        </div>

        {/* Hero Header Strip */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-28 rounded-full skeleton-shimmer bg-gold/15" />
            <div className="h-6 w-20 rounded-full skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
          </div>

          <div className="space-y-2.5">
            <div className="h-8 sm:h-12 w-11/12 rounded-2xl skeleton-shimmer bg-stone-200/90 dark:bg-zinc-800/90" />
            <div className="h-8 sm:h-12 w-4/5 rounded-2xl skeleton-shimmer bg-stone-200/90 dark:bg-zinc-800/90" />
          </div>

          {/* Author Metadata Bar */}
          <div className="pt-2 flex items-center justify-between border-y border-stone-200/80 dark:border-zinc-800/80 py-3.5">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded-md skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80" />
                <div className="h-3 w-20 rounded-md skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
              <div className="h-8 w-8 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            </div>
          </div>
        </div>

        {/* Reading Paper Hero Image */}
        <div className="h-64 sm:h-96 w-full rounded-3xl skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60 shadow-apple-card" />

        {/* Article Body Content Paragraphs */}
        <div className="space-y-6 pt-4">
          <div className="space-y-2.5">
            <div className="h-4.5 w-full rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            <div className="h-4.5 w-[96%] rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            <div className="h-4.5 w-[92%] rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            <div className="h-4.5 w-[85%] rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
          </div>

          <div className="pt-3 space-y-2">
            <div className="h-6 w-1/3 rounded-xl skeleton-shimmer bg-stone-200/85 dark:bg-zinc-800/85" />
            <div className="h-4.5 w-full rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            <div className="h-4.5 w-[94%] rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            <div className="h-4.5 w-[88%] rounded-lg skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
          </div>

          {/* Reference Citation Card Skeleton */}
          <div className="rounded-2xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-zinc-900/70 p-5 space-y-2">
            <div className="h-3.5 w-32 rounded skeleton-shimmer bg-gold/20" />
            <div className="h-3 w-5/6 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composite Topic Card Skeleton
 * Matches TopicsPage.tsx and HomePage.tsx topic cards.
 */
export function TopicCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading research discipline"
      className={`group relative flex flex-col justify-between h-40 sm:h-64 rounded-2xl sm:rounded-3xl border border-stone-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90 p-3 sm:p-8 shadow-apple-sm ${className}`}
    >
      {/* Header: Emblem & Arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl skeleton-shimmer bg-gold/15 shrink-0" />
        <div className="h-3.5 sm:h-4 w-10 sm:w-16 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
      </div>

      {/* Body: Title & Excerpt */}
      <div className="space-y-1.5 sm:space-y-2.5 mt-2 sm:mt-4">
        <div className="h-3.5 sm:h-5 w-3/4 rounded-lg skeleton-shimmer bg-stone-200/85 dark:bg-zinc-800/85" />
        <div className="hidden sm:block space-y-1.5 pt-1">
          <div className="h-2.5 w-full rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
          <div className="h-2.5 w-4/5 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
        </div>
      </div>

      {/* Footer Pill */}
      <div className="pt-2 sm:pt-4 border-t border-stone-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="h-2.5 sm:h-3 w-14 sm:w-20 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
        <div className="h-2.5 sm:h-3 w-8 sm:w-12 rounded skeleton-shimmer bg-gold/20" />
      </div>
    </div>
  );
}

/**
 * Composite Event Card Skeleton
 * Matches EventsPage.tsx schedule rows.
 */
export function EventCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading event"
      className={`rounded-2xl border border-border/80 bg-surface/80 p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-5 shadow-apple-sm ${className}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Date Stamp Box Skeleton */}
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl skeleton-shimmer bg-gold/15 shrink-0" />

        {/* Middle Info */}
        <div className="space-y-2 min-w-0">
          <div className="h-4 sm:h-5 w-48 sm:w-72 rounded-lg skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded-md skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
            <div className="h-3 w-24 rounded-md skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
          </div>
        </div>
      </div>

      {/* Action Button Skeleton */}
      <div className="hidden sm:block h-9 w-28 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70 shrink-0" />
    </div>
  );
}

/**
 * Composite DataTable Skeleton
 * Matches DataTable.tsx for smooth ERP administrative data loading.
 */
export function DataTableSkeleton({
  columns = 4,
  rows = 5,
  className = '',
}: {
  columns?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading table records"
      className={`rounded-2xl border border-border/80 bg-surface overflow-hidden shadow-apple-sm ${className}`}
    >
      {/* Table Header Skeleton */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border/80 bg-stone-50/70 dark:bg-zinc-900/70">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className={`h-3.5 rounded-md skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80 ${
              i === 0 ? 'w-1/4' : i === 1 ? 'w-1/3' : 'flex-1'
            }`}
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-6 py-4.5">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-3 rounded-md skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60 ${
                  colIndex === 0
                    ? 'w-1/4'
                    : colIndex === 1
                    ? 'w-1/3'
                    : colIndex === columns - 1
                    ? 'w-16 ml-auto'
                    : 'flex-1'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Composite Notification Item Skeleton
 * Matches notification feed in MiniDashboardPage.tsx.
 */
export function NotificationSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading notifications"
      className={`flex items-start justify-between rounded-2xl border border-border/70 bg-surface/70 p-3.5 sm:p-4 shadow-apple-sm ${className}`}
    >
      <div className="space-y-2 min-w-0 flex-1 pr-4">
        <div className="h-3.5 w-1/3 rounded-md skeleton-shimmer bg-stone-200/80 dark:bg-zinc-800/80" />
        <div className="h-3 w-3/4 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
        <div className="h-2.5 w-20 rounded skeleton-shimmer bg-stone-200/50 dark:bg-zinc-800/50" />
      </div>
      <div className="h-3 w-12 rounded skeleton-shimmer bg-gold/20 shrink-0 self-center" />
    </div>
  );
}

/**
 * Composite Task Card Skeleton
 * Accurately mirrors TaskCard in WorkspacePage.tsx
 */
export function TaskCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading task"
      className={`rounded-xl border border-border bg-surface p-4 shadow-sm space-y-3 ${className}`}
    >
      {/* Header: Type and Status */}
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-16 rounded skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
        <div className="h-5 w-20 rounded-full skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
      </div>

      {/* Task Title */}
      <div className="space-y-1.5 pt-1">
        <div className="h-4 w-4/5 rounded skeleton-shimmer bg-stone-200/85 dark:bg-zinc-800/85" />
        <div className="h-3.5 w-1/2 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
      </div>

      {/* Description */}
      <div className="space-y-1 pt-1">
        <div className="h-2.5 w-full rounded skeleton-shimmer bg-stone-200/50 dark:bg-zinc-800/50" />
        <div className="h-2.5 w-3/4 rounded skeleton-shimmer bg-stone-200/50 dark:bg-zinc-800/50" />
      </div>

      {/* Footer: Due date badge & action */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <div className="h-4 w-24 rounded-full skeleton-shimmer bg-gold/15" />
        <div className="h-3.5 w-12 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
      </div>
    </div>
  );
}

/**
 * Composite Calendar Grid Skeleton
 * Matches CalendarPage.tsx month calendar layout
 */
export function CalendarGridSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading operations calendar"
      className={`rounded-2xl border border-border bg-surface overflow-hidden shadow-apple-sm ${className}`}
    >
      {/* Day of week column headers */}
      <div className="grid grid-cols-7 border-b border-border bg-stone-50/50 dark:bg-zinc-900/50 py-3 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="flex justify-center">
            <div className="h-3 w-8 rounded skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
          </div>
        ))}
      </div>

      {/* 35 Calendar Cells (5 weeks x 7 days) */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[90px] sm:min-h-[110px] p-2 space-y-1.5 flex flex-col justify-between">
            <div className="h-4 w-4 rounded-full skeleton-shimmer bg-stone-200/70 dark:bg-zinc-800/70" />
            {i % 3 === 0 && (
              <div className="h-4 w-full rounded-md skeleton-shimmer bg-gold/15" />
            )}
            {i % 5 === 0 && (
              <div className="h-4 w-4/5 rounded-md skeleton-shimmer bg-blue-500/15" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Composite Stats Grid Skeleton
 * Matches 4-KPI metrics strip across Workspace and Admin consoles
 */
export function StatsGridSkeleton({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-3.5 sm:p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded skeleton-shimmer bg-stone-200/60 dark:bg-zinc-800/60" />
            <div className="h-7 w-7 rounded-lg skeleton-shimmer bg-gold/15" />
          </div>
          <div className="h-7 w-16 rounded skeleton-shimmer bg-stone-200/90 dark:bg-zinc-800/90" />
          <div className="h-2.5 w-24 rounded skeleton-shimmer bg-stone-200/50 dark:bg-zinc-800/50" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
