"use client";

import React from 'react';
import { PythonBitcoinComponents } from './PythonBitcoinComponents';

interface PythonBitcoinClientProps {
  adresa: string;
}

// Ova komponenta služi kao klijentska omotnica za PythonBitcoinComponents
export default function PythonBitcoinClient({ adresa }: PythonBitcoinClientProps) {
  return <PythonBitcoinComponents address={adresa} />;
}
