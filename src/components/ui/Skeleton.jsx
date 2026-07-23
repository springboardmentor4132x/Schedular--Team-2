import React from 'react';

export function CardSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-slate-100 dark:border-slate-700/60">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
        <div className="w-16 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="w-12 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-slate-100 dark:border-slate-700/60">
      <div className="w-48 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="space-y-3 pt-2">
        <div className="flex justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
          <div className="w-1/4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-1/3 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="w-1/5 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between py-1">
            <div className="w-1/5 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-1/4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-1/6 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-slate-100 dark:border-slate-700/60">
      <div className="w-40 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 h-4 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
            <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-slate-100 dark:border-slate-700/60">
      <div className="w-32 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="h-48 rounded bg-slate-200 dark:bg-slate-700"></div>
    </div>
  );
}
