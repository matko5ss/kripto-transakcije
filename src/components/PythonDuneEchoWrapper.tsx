"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import PythonEthereumStatusSimple from './PythonEthereumStatusSimple';

// Dinamički uvozimo klijentske komponente kako bismo izbjegli probleme s renderiranjem na serveru
const PythonDuneEchoClient = dynamic(
  () => import('@/components/PythonDuneEchoClient'),
  { ssr: false }
);

interface PythonDuneEchoWrapperProps {
  adresa: string;
}

export default function PythonDuneEchoWrapper({ adresa }: PythonDuneEchoWrapperProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Podaci u stvarnom vremenu (Python API)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Sljedeći podaci se automatski osvježavaju svakih 10 sekundi:</p>
      
      {/* Status Ethereum mreže */}
      <PythonEthereumStatusSimple />
      
      {/* Klijentska komponenta koja koristi Python API */}
      <PythonDuneEchoClient adresa={adresa} />
    </div>
  );
}
