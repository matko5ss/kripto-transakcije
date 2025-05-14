"use client";

import React from 'react';
import { PythonDuneEchoComponents } from './PythonDuneEchoComponents';

interface PythonDuneEchoClientProps {
  adresa: string;
}

// Ova komponenta služi kao klijentska omotnica za PythonDuneEchoComponents
export default function PythonDuneEchoClient({ adresa }: PythonDuneEchoClientProps) {
  return <PythonDuneEchoComponents address={adresa} />;
}
