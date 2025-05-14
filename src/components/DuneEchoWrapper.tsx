"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dinamički uvozimo klijentske komponente kako bismo izbjegli probleme s renderiranjem na serveru
const DuneEchoClient = dynamic(
  () => import('@/components/DuneEchoClient'),
  { ssr: false }
);

interface DuneEchoWrapperProps {
  adresa: string;
}

export default function DuneEchoWrapper({ adresa }: DuneEchoWrapperProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Podaci u stvarnom vremenu</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Sljedeći podaci se automatski osvježavaju svakih 10 sekundi:</p>
      
      {/* Klijentska komponenta koja koristi Dune Echo Hooks */}
      <DuneEchoClient adresa={adresa} />
    </div>
  );
}
