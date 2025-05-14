"use client";

import React from 'react';
import PythonTokenBalances from './PythonTokenBalances';
import PythonTransakcijeEcho from './PythonTransakcijeEcho';

interface PythonDuneEchoComponentsProps {
  address: string;
}

export function PythonDuneEchoComponents({ address }: PythonDuneEchoComponentsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <PythonTokenBalances address={address} />
        </div>
        <div className="lg:col-span-2">
          <PythonTransakcijeEcho address={address} />
        </div>
      </div>
    </>
  );
}
