'use client';

import { ReactNode } from 'react';

interface PodaciKarticaProps {
  naslov: string;
  vrijednost: string | number | ReactNode;
  ikona?: ReactNode;
  boja?: string;
  promjena?: number;
}

export default function PodaciKartica({ naslov, vrijednost, ikona, boja = 'blue', promjena }: PodaciKarticaProps) {
  const bojaPozadine = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  }[boja];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{naslov}</h3>
        {ikona && <div className={`p-2 rounded-full ${bojaPozadine}`}>{ikona}</div>}
      </div>
      
      <div className="flex items-end">
        <div className="text-2xl font-bold">{vrijednost}</div>
        
        {promjena !== undefined && (
          <div className={`ml-2 text-sm ${promjena >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {promjena >= 0 ? '+' : ''}{promjena}%
          </div>
        )}
      </div>
    </div>
  );
}
