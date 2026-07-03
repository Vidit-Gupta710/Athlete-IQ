import React from 'react';

export default function PageContainer({ children }) {
  return (
    <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-fade-in focus:outline-none">
      {children}
    </main>
  );
}
