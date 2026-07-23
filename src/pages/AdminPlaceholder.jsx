import React from 'react';

export default function AdminPlaceholder({ title, description }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h1>
      <p className="text-slate-700 dark:text-slate-300">{description}</p>
    </div>
  );
}
