import React from 'react'

export function CardSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-default bg-card">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-surface"></div>
        <div className="w-16 h-4 rounded bg-surface"></div>
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 rounded bg-surface"></div>
        <div className="w-12 h-6 rounded bg-surface"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 3 }) {
  return (
    <div className="card animate-pulse space-y-4 border border-default bg-card">
      <div className="w-48 h-5 rounded bg-surface"></div>
      <div className="space-y-3 pt-2">
        <div className="flex justify-between border-b pb-2 border-default">
          <div className="w-1/4 h-4 rounded bg-surface"></div>
          <div className="w-1/3 h-4 rounded bg-surface"></div>
          <div className="w-1/5 h-4 rounded bg-surface"></div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between py-1.5">
            <div className="w-1/5 h-4 rounded bg-surface"></div>
            <div className="w-1/4 h-4 rounded bg-surface"></div>
            <div className="w-1/6 h-4 rounded bg-surface"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 4 }) {
  return (
    <div className="card animate-pulse space-y-4 border border-default bg-card">
      <div className="w-40 h-5 rounded bg-surface"></div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface flex-shrink-0"></div>
            <div className="flex-1 space-y-1.5">
              <div className="w-2/3 h-4 rounded bg-surface"></div>
              <div className="w-1/3 h-3 rounded bg-surface"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-default bg-card">
      <div className="flex justify-between items-center">
        <div className="w-36 h-5 rounded bg-surface"></div>
        <div className="w-20 h-4 rounded bg-surface"></div>
      </div>
      <div className="h-56 rounded-xl bg-surface flex items-end justify-between p-4 gap-2">
        {[40, 65, 30, 85, 55, 70, 95, 45, 60, 80].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-surface rounded-t opacity-60"
            style={{ height: `${h}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="card animate-pulse space-y-4 border border-default bg-card">
      <div className="w-32 h-5 rounded bg-surface"></div>
      <div className="h-48 rounded bg-surface"></div>
    </div>
  );
}
