"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { DuneProvider } from '@duneanalytics/hooks';

interface DuneEchoContextType {
  apiKey: string;
}

const DuneEchoContext = createContext<DuneEchoContextType | null>(null);

export const useDuneEcho = () => {
  const context = useContext(DuneEchoContext);
  if (!context) {
    throw new Error('useDuneEcho must be used within a DuneEchoProvider');
  }
  return context;
};

export function DuneEchoProvider({ children }: { children: ReactNode }) {
  // Dohvati API ključ iz environment varijable
  const apiKey = process.env.NEXT_PUBLIC_DUNE_API_KEY || '';

  return (
    <DuneProvider apiKey={apiKey}>
      <DuneEchoContext.Provider value={{ apiKey }}>
        {children}
      </DuneEchoContext.Provider>
    </DuneProvider>
  );
}
