"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaEthereum, FaGasPump, FaCubes, FaExchangeAlt } from 'react-icons/fa';
import { getEthereumStatus } from '@/services/pythonDuneService';

export default function PythonEthereumStatusSimple() {
  const [latestBlock, setLatestBlock] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Funkcija za dohvaćanje podataka o Ethereum mreži
  const fetchEthereumStatus = useCallback(async () => {
    try {
      const data = await getEthereumStatus();
      
      if (data) {
        setLatestBlock(data.last_block);
        setGasPrice(data.gas_price);
        setEthPrice(data.price);
        setTransactionCount(data.transactions_count);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Greška:', err);
      setError('Greška pri dohvaćanju statusa Ethereum mreže');
      setIsLoading(false);
    }
  }, []);
  
  // Dohvaćamo podatke pri učitavanju komponente i svakih 10 sekundi
  useEffect(() => {
    fetchEthereumStatus();
    
    const interval = setInterval(() => {
      fetchEthereumStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchEthereumStatus]);
  
  // Funkcija za formatiranje cijene plina
  const formatGasPrice = (gasPrice: number) => {
    return `${gasPrice.toFixed(2)} Gwei`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Status Ethereum mreže</h2>
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
        <h2 className="text-xl font-semibold mb-4">Status Ethereum mreže</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
      <h2 className="text-xl font-semibold mb-4">Status Ethereum mreže</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaCubes className="text-blue-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Zadnji blok</p>
          <p className="text-xl font-semibold">{latestBlock.toLocaleString()}</p>
        </div>
        
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaGasPump className="text-green-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Cijena plina</p>
          <p className="text-xl font-semibold">{formatGasPrice(gasPrice)}</p>
        </div>
        
        <div className="p-4 rounded-lg">
          <div className="flex justify-center mb-2">
            <FaEthereum className="text-purple-500 text-2xl" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Cijena ETH</p>
          <p className="text-xl font-semibold">${ethPrice.toFixed(2)}</p>
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
