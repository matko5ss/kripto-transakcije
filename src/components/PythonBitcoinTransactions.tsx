"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaBitcoin } from 'react-icons/fa';
import { getBitcoinTransactions, BitcoinTransaction } from '@/services/pythonBitcoinService';

interface PythonBitcoinTransactionsProps {
  address?: string;
  limit?: number;
}

export default function PythonBitcoinTransactions({ address, limit = 10 }: PythonBitcoinTransactionsProps) {
  const [transactions, setTransactions] = useState<BitcoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTransactions, setNewTransactions] = useState<string[]>([]);

  // Funkcija za dohvaćanje transakcija
  const fetchTransactions = useCallback(async () => {
    try {
      let data: BitcoinTransaction[];
      
      if (address) {
        // Ako je adresa specificirana, dohvaćamo transakcije za tu adresu
        const response = await fetch(`http://localhost:8001/api/bitcoin/transactions/${address}?limit=${limit}`);
        data = await response.json();
      } else {
        // Inače dohvaćamo zadnje transakcije
        data = await getBitcoinTransactions(limit);
      }
      
      if (data && data.length > 0) {
        // Provjeravamo ima li novih transakcija
        const currentTxIds = transactions.map(tx => tx.txid);
        const newTxIds = data.filter(tx => !currentTxIds.includes(tx.txid)).map(tx => tx.txid);
        
        setNewTransactions(newTxIds);
        setTransactions(data);
        
        // Resetiramo animaciju nakon 3 sekunde
        if (newTxIds.length > 0) {
          setTimeout(() => {
            setNewTransactions([]);
          }, 3000);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Greška:', err);
      setError('Greška pri dohvaćanju Bitcoin transakcija');
      setIsLoading(false);
    }
  }, [address, limit, transactions]);
  
  // Dohvaćamo podatke pri učitavanju komponente i svakih 10 sekundi
  useEffect(() => {
    fetchTransactions();
    
    const interval = setInterval(() => {
      fetchTransactions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchTransactions]);
  
  // Funkcija za formatiranje vremena
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Funkcija za skraćivanje adrese
  const shortenAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Zadnje Bitcoin transakcije</h2>
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b dark:border-gray-700 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Zadnje Bitcoin transakcije</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">
        {address ? `Bitcoin transakcije za adresu ${shortenAddress(address)}` : 'Zadnje Bitcoin transakcije'}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 text-left">Hash</th>
              <th className="py-2 px-4 text-left">Blok</th>
              <th className="py-2 px-4 text-left">Vrijeme</th>
              <th className="py-2 px-4 text-left">Od</th>
              <th className="py-2 px-4 text-left">Za</th>
              <th className="py-2 px-4 text-right">Vrijednost</th>
              <th className="py-2 px-4 text-right">Naknada</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr 
                key={tx.txid} 
                className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  newTransactions.includes(tx.txid) ? 'bg-yellow-50 dark:bg-yellow-900/20 animate-pulse' : ''
                }`}
              >
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/tx/${tx.txid}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {shortenAddress(tx.txid)}
                  </a>
                </td>
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/block/${tx.block_height}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {tx.block_height}
                  </a>
                </td>
                <td className="py-2 px-4">{formatTime(tx.timestamp)}</td>
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/address/${tx.sender}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {shortenAddress(tx.sender)}
                  </a>
                </td>
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/address/${tx.recipient}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {shortenAddress(tx.recipient)}
                  </a>
                </td>
                <td className="py-2 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <FaBitcoin className="text-orange-500 mr-1" />
                    <span>{parseFloat(tx.value).toFixed(8)}</span>
                  </div>
                </td>
                <td className="py-2 px-4 text-right">{parseFloat(tx.fee).toFixed(8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
