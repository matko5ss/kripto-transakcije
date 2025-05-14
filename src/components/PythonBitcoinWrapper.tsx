"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import PythonBitcoinStatusSimple from './PythonBitcoinStatusSimple';
import PythonBitcoinBlocks from './PythonBitcoinBlocks';
import PythonBitcoinTransactions from './PythonBitcoinTransactions';
import PythonBitcoinTransactionSearchContainer from './PythonBitcoinTransactionSearchContainer';

// Dinamički uvozimo klijentske komponente kako bismo izbjegli probleme s renderiranjem na serveru
const PythonBitcoinClient = dynamic(
  () => import('@/components/PythonBitcoinClient'),
  { ssr: false }
);

interface PythonBitcoinWrapperProps {
  adresa?: string;
}

export default function PythonBitcoinWrapper({ adresa }: PythonBitcoinWrapperProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bitcoin podaci u stvarnom vremenu (Python API)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Sljedeći podaci se automatski osvježavaju svakih 10 sekundi:</p>
      
      {/* Status Bitcoin mreže */}
      <PythonBitcoinStatusSimple />
      
      {/* Zadnji Bitcoin blokovi */}
      <div className="mb-6">
        <PythonBitcoinBlocks limit={5} />
      </div>
      
      {/* Pretraživač Bitcoin transakcija */}
      <div className="mb-6">
        <PythonBitcoinTransactionSearchContainer />
      </div>

      {/* Klijentska komponenta koja koristi Python API - prikazuje se samo ako je adresa specificirana */}
      {adresa && <PythonBitcoinClient adresa={adresa} />}
      
      {/* Ako adresa nije specificirana, prikazujemo zadnje transakcije */}
      {!adresa && (
        <div className="mb-6">
          <PythonBitcoinTransactions limit={10} />
        </div>
      )}
    </div>
  );
}
