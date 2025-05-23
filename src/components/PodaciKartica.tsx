'use client';

import { ReactNode, useState } from 'react';

interface PodaciKarticaProps {
  naslov: string;
  vrijednost: string | number | ReactNode;
  ikona?: ReactNode;
  boja?: string;
  promjena?: number;
  tooltip?: string;
  opis?: string;
  loading?: boolean;
}

export default function PodaciKartica({ naslov, vrijednost, ikona, boja = 'blue', promjena, tooltip, opis, loading = false }: PodaciKarticaProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const bojaPozadine = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  }[boja];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{naslov}</h3>
        {ikona && <div className={`p-2 rounded-full ${bojaPozadine}`}>{ikona}</div>}
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-end relative">
          <div className="text-2xl font-bold"
            onMouseEnter={() => tooltip && setShowTooltip(true)}
            onMouseLeave={() => tooltip && setShowTooltip(false)}
          >
            {vrijednost}
            
            {tooltip && showTooltip && (
              <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
                {tooltip}
              </div>
            )}
          </div>
          
          {promjena !== undefined && (
            <div className={`ml-2 text-sm ${promjena >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {promjena >= 0 ? '+' : ''}{promjena}%
            </div>
          )}
        </div>
        
        {opis && (
          <div className="text-xs text-gray-500 mt-1">{opis}</div>
        )}
      </div>
    </div>
  );
}
