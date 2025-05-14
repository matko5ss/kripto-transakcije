"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaBitcoin } from 'react-icons/fa';
import { getBitcoinStatus } from '@/services/pythonBitcoinService';

interface PythonBitcoinPriceProps {
  refreshInterval?: number; // u milisekundama
}

export default function PythonBitcoinPrice({ refreshInterval = 60000 }: PythonBitcoinPriceProps) {
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Funkcija za dohvaćanje cijene Bitcoina
  const fetchBitcoinPrice = useCallback(async () => {
    try {
      const data = await getBitcoinStatus();
      
      if (data) {
        setPrice(data.price);
        
        // Postavljamo vrijeme zadnjeg osvježavanja
        const now = new Date();
        setLastUpdated(
          `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Greška pri dohvaćanju cijene Bitcoina:', err);
      setError('Greška pri dohvaćanju cijene Bitcoina');
      setIsLoading(false);
    }
  }, []);

  // Dohvaćamo podatke pri učitavanju komponente i svakih X sekundi
  useEffect(() => {
    fetchBitcoinPrice();
    
    const interval = setInterval(() => {
      fetchBitcoinPrice();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchBitcoinPrice, refreshInterval]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="animate-pulse">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
      <div className="flex justify-center mb-2">
        <FaBitcoin className="text-orange-500 text-4xl" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Bitcoin cijena (Dune API preko Pythona)</h2>
      <p className="text-3xl font-bold text-orange-500">${price.toLocaleString('hr-HR', { maximumFractionDigits: 2 })}</p>
      
      {lastUpdated && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
          <span className="mr-2">Osvježava se svakih {refreshInterval/1000}s</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Zadnje osvježeno: {lastUpdated}
          </span>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        Izvor: Dune Analytics API preko Python backenda
      </div>
    </div>
  );
}
