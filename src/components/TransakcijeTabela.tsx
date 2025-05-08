'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Transakcija, Blok } from '../services/dune';
import { FaEthereum, FaArrowRight, FaCube } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface TransakcijeTabelaProps {
  transakcije: Transakcija[];
  blokovi?: Blok[];
  naslov?: React.ReactNode;
}

export default function TransakcijeTabela({ transakcije, blokovi = [], naslov }: TransakcijeTabelaProps) {
  // Dodajemo stanje za animaciju novih transakcija
  const [animiraneTransakcije, setAnimiraneTransakcije] = useState<string[]>([]);
  // Dodajemo stanje za praćenje trenutno prikazanog tipa podataka (transakcije ili blokovi)
  const [prikazaniTip, setPrikazaniTip] = useState<'transakcije' | 'blokovi'>('transakcije');
  
  // Pratimo promjene u transakcijama i dodajemo animaciju za nove
  useEffect(() => {
    // Dohvaćamo hash-eve novih transakcija
    const noviHashevi = transakcije.map(tx => tx.hash);
    
    // Postavljamo animaciju
    setAnimiraneTransakcije(noviHashevi);
    
    // Uklanjamo animaciju nakon 2 sekunde
    const timer = setTimeout(() => {
      setAnimiraneTransakcije([]);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [transakcije]);

  // Izmjenjujemo prikaz transakcija i blokova svakih 15 sekundi
  useEffect(() => {
    // Provjera imamo li blokove za prikaz
    if (blokovi && blokovi.length > 0) {
      const interval = setInterval(() => {
        setPrikazaniTip(prev => prev === 'transakcije' ? 'blokovi' : 'transakcije');
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [blokovi]);
  
  // Sortiramo transakcije od najnovije prema najstarijoj
  const sortiraneTransakcije = [...transakcije].sort((a, b) => {
    // Prvo pokušavamo sortirati po vremenu
    if (a.blockTimestamp && b.blockTimestamp) {
      return new Date(b.blockTimestamp).getTime() - new Date(a.blockTimestamp).getTime();
    }
    
    // Ako nema vremena, sortiramo po broju bloka
    if (a.blockNumber && b.blockNumber) {
      return parseInt(b.blockNumber) - parseInt(a.blockNumber);
    }
    
    return 0;
  });

  // Sortiramo blokove od najnovijeg prema najstarijem
  const sortiraniBlokovi = [...blokovi].sort((a, b) => {
    // Sortiramo po broju bloka
    return parseInt(b.number) - parseInt(a.number);
  });

  // Funkcija za formatiranje vremena
  const formatirajVrijeme = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: hr });
    } catch {
      return 'Nepoznato vrijeme';
    }
  };

  // Funkcija za skraćivanje hash-a
  const skratiHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Funkcija za formatiranje ETH vrijednosti
  const formatirajEth = (value: string) => {
    try {
      const eth = parseFloat(value) / 1e18;
      if (eth === 0) return '0';
      if (eth < 0.00001) return '< 0.00001';
      return eth.toFixed(eth < 0.001 ? 6 : 4);
    } catch {
      return '0';
    }
  };

  // Određujemo naslov ovisno o trenutno prikazanim podacima ili koristimo predani naslov ako postoji
  const dinamickiNaslov = naslov || (prikazaniTip === 'transakcije' ? 
    'Zadnje transakcije' : 
    'Zadnji blokovi');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{dinamickiNaslov}</h2>
        <div className="flex items-center">
          <button 
            onClick={() => setPrikazaniTip('transakcije')} 
            className={`mr-3 px-3 py-1 rounded text-sm ${prikazaniTip === 'transakcije' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Transakcije
          </button>
          <button 
            onClick={() => setPrikazaniTip('blokovi')} 
            className={`px-3 py-1 rounded text-sm ${prikazaniTip === 'blokovi' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Blokovi
          </button>
        </div>
      </div>
      
      {/* Prikaz transakcija */}
      {prikazaniTip === 'transakcije' && (
        sortiraneTransakcije.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nema dostupnih transakcija
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hash
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Blok
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vrijeme
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Od
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Za
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vrijednost
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortiraneTransakcije.map((tx) => (
                  <tr 
                    key={tx.hash} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      animiraneTransakcije.includes(tx.hash) ? 'bg-blue-50 dark:bg-blue-900 animate-pulse' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/transakcije/${tx.hash}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {skratiHash(tx.hash)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/blokovi/${tx.blockNumber}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {tx.blockNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatirajVrijeme(tx.blockTimestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/adrese/${tx.from}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {skratiHash(tx.from)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {tx.to ? (
                        <Link href={`/adrese/${tx.to}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {skratiHash(tx.to)}
                        </Link>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Stvaranje ugovora</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaEthereum className="mr-1 text-blue-500" />
                        <span>{formatirajEth(tx.value)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {tx.isError === "0" ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Uspješno
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Neuspješno
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Prikaz blokova */}
      {prikazaniTip === 'blokovi' && (
        sortiraniBlokovi.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nema dostupnih blokova
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Broj
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vrijeme
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hash
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rudar
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gas korišten
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gas limit
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transakcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortiraniBlokovi.map((blok) => (
                  <tr key={blok.number} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/blokovi/${blok.number}`} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                        <FaCube className="mr-1 text-blue-500" />
                        {blok.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatirajVrijeme(parseTimestamp(blok.timestamp))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/blokovi/${blok.number}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {skratiHash(blok.hash)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/adrese/${blok.miner}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {skratiHash(blok.miner)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {parseInt(blok.gasUsed).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {parseInt(blok.gasLimit).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {blok.transactions ? blok.transactions.length : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      
      <div className="mt-4 text-right">
        <Link href={prikazaniTip === 'transakcije' ? "/transakcije" : "/blokovi"} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end">
          <span>Prikaži sve {prikazaniTip === 'transakcije' ? 'transakcije' : 'blokove'}</span>
          <FaArrowRight className="ml-1" />
        </Link>
      </div>
    </div>
  );
}

// Pomoćna funkcija za parsiranje Unix timestamp-a u ISO string
function parseTimestamp(timestamp: string | number): string {
  if (typeof timestamp === 'string') {
    // Ako je timestamp već string, pokušamo ga parsirati
    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum)) {
      return timestamp; // Vraćamo originalni string ako nije broj
    }
    timestamp = timestampNum;
  }
  
  // Pretvaramo Unix timestamp u ISO string
  return new Date(timestamp * 1000).toISOString();
}
