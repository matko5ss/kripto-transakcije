"use client";

import React from 'react';
import PythonBitcoinTransactions from './PythonBitcoinTransactions';
import dynamic from 'next/dynamic';

// Dinamički uvozimo komponentu za informacije o adresi
const PythonBitcoinAddressInfo = dynamic(
  () => import('./PythonBitcoinAddressInfo').then(mod => mod.default),
  { ssr: false }
);

interface PythonBitcoinComponentsProps {
  address: string;
}

export function PythonBitcoinComponents({ address }: PythonBitcoinComponentsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <PythonBitcoinAddressInfo address={address} />
        </div>
        <div className="lg:col-span-2">
          <PythonBitcoinTransactions address={address} />
        </div>
      </div>
    </>
  );
}
