"use client";

import React from 'react';
import TokenBalances from './TokenBalances';
import TransakcijeEcho from './TransakcijeEcho';

interface DuneEchoComponentsProps {
  address: string;
}

export function DuneEchoComponents({ address }: DuneEchoComponentsProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <TokenBalances address={address} />
        </div>
        <div className="lg:col-span-2">
          <TransakcijeEcho address={address} />
        </div>
      </div>
    </>
  );
}
