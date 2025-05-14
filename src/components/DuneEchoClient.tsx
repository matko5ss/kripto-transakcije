"use client";

import React from 'react';
import { DuneEchoComponents } from './DuneEchoComponents';

interface DuneEchoClientProps {
  adresa: string;
}

// Ova komponenta služi kao klijentska omotnica za DuneEchoComponents
export default function DuneEchoClient({ adresa }: DuneEchoClientProps) {
  return <DuneEchoComponents address={adresa} />;
}
