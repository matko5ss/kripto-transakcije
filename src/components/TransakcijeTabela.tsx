'use client';

import Link from 'next/link';
import { Transakcija } from '../services/moralis';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';

interface TransakcijeTabelaProps {
  transakcije: Transakcija[];
  naslov?: string;
}

export default function TransakcijeTabela({ transakcije, naslov = 'Zadnje transakcije' }: TransakcijeTabelaProps) {
  // Funkcija za skraćivanje hash vrijednosti
  const skratiHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Funkcija za formatiranje vrijednosti u ETH
  const formatirajEth = (vrijednost: string) => {
    const eth = parseFloat(vrijednost) / 1e18;
    return eth.toFixed(6);
  };

  // Funkcija za formatiranje vremena
  const formatirajVrijeme = (timestamp: string) => {
    try {
      const datum = new Date(timestamp);
      return formatDistanceToNow(datum, { addSuffix: true, locale: hr });
    } catch {
      return timestamp;
    }
  };

  // Sortiramo transakcije po vremenu - najnovije prvo
  const sortiraneTransakcije = [...transakcije].sort((a, b) => {
    const datumA = new Date(a.blockTimestamp).getTime();
    const datumB = new Date(b.blockTimestamp).getTime();
    return datumB - datumA;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">{naslov}</h2>
        <div className="text-sm text-gray-500">
          Ukupno: {transakcije.length} transakcija
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hash transakcije
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blok
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vrijeme
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Od
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Za
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vrijednost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortiraneTransakcije.length > 0 ? (
              sortiraneTransakcije.map((tx) => (
                <tr key={tx.hash} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/transakcije/${tx.hash}`} className="text-blue-600 hover:underline">
                      {skratiHash(tx.hash)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/blokovi/${tx.blockNumber}`} className="text-blue-600 hover:underline">
                      {tx.blockNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatirajVrijeme(tx.blockTimestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/adrese/${tx.from}`} className="text-blue-600 hover:underline">
                      {skratiHash(tx.from)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tx.to ? (
                      <Link href={`/adrese/${tx.to}`} className="text-blue-600 hover:underline">
                        {skratiHash(tx.to)}
                      </Link>
                    ) : (
                      <span className="text-gray-500">Kreiranje ugovora</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatirajEth(tx.value)} ETH
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Nema dostupnih transakcija
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
