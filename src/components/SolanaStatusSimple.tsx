"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaCoins, FaNetworkWired, FaCubes, FaExchangeAlt } from 'react-icons/fa';

export default function SolanaStatusSimple() {
  const [latestSlot, setLatestSlot] = useState(0);
  const [transactionCost, setTransactionCost] = useState('0');
  const [solPrice, setSolPrice] = useState('0');
  const [transactionCount, setTransactionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Koristimo API ključ iz environment varijable
  const apiKey = process.env.NEXT_PUBLIC_DUNE_API_KEY || '';
  
  // Funkcija za dohvaćanje podataka o Solana mreži
  const fetchSolanaStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Dohvaćamo podatke o cijeni SOL-a
      const priceResponse = await fetch(`https://api.dune.com/v1/solana/price`, {
        headers: {
          'x-dune-api-key': apiKey
        }
      });
      
      if (!priceResponse.ok) {
        throw new Error('Greška pri dohvaćanju podataka o cijeni');
      }
      
      const priceData = await priceResponse.json();
      setSolPrice(priceData.usd || '0');
      
      // Simulirani podaci za ostale vrijednosti (u stvarnoj implementaciji bi se dohvaćali s API-ja)
      setLatestSlot(Math.floor(200000000 + Math.random() * 1000000));
      setTransactionCost((0.000005 + Math.random() * 0.000001).toFixed(8));
      setTransactionCount(Math.floor(1000 + Math.random() * 500));
      
      setIsLoading(false);
    } catch (err) {
      console.error('Greška:', err);
      setError('Greška pri dohvaćanju statusa Solana mreže');
      setIsLoading(false);
      
      // Fallback vrijednosti u slučaju greške
      setSolPrice('100.25');
      setLatestSlot(200456789);
      setTransactionCost('0.000005');
      setTransactionCount(1250);
    }
  }, [apiKey]);
  
  // Dohvaćamo podatke pri učitavanju komponente i svakih 10 sekundi
  useEffect(() => {
    fetchSolanaStatus();
    
    const interval = setInterval(() => {
      fetchSolanaStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchSolanaStatus]);
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Status Solana mreže</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Status Solana mreže</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Status Solana mreže</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaCubes className="text-purple-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Zadnji slot</p>
          <p className="text-xl font-semibold">{latestSlot.toLocaleString()}</p>
        </div>
        
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaNetworkWired className="text-green-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Cijena transakcije</p>
          <p className="text-xl font-semibold">{transactionCost} SOL</p>
        </div>
        
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaCoins className="text-blue-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Cijena SOL</p>
          <p className="text-xl font-semibold">${parseFloat(solPrice).toFixed(2)}</p>
        </div>
        
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaExchangeAlt className="text-orange-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Broj transakcija</p>
          <p className="text-xl font-semibold">{transactionCount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
