"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTransactions, Transaction } from '@/services/pythonDuneService';

// Funkcija za formatiranje ETH vrijednosti (zamjena za formatEther iz ethers)
const formatEther = (value: string): string => {
  const wei = BigInt(value);
  const etherValue = Number(wei) / 1e18;
  return etherValue.toString();
};

interface TransakcijeEchoProps {
  address: string;
}

interface TransactionWithStatus extends Transaction {
  isNew?: boolean;
}

export default function PythonTransakcijeEcho({ address }: TransakcijeEchoProps) {
  const [transactions, setTransactions] = useState<TransactionWithStatus[]>([]);
  const [previousHashes, setPreviousHashes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Funkcija za dohvaćanje transakcija
  const fetchTransactions = async () => {
    try {
      const data = await getTransactions(address);
      
      if (data) {
        // Spremamo hash-eve prethodnih transakcija za usporedbu
        setPreviousHashes(transactions.map(tx => tx.hash));
        
        // Označavanje novih transakcija
        const newTransactions = data.map(tx => ({
          ...tx,
          isNew: !previousHashes.includes(tx.hash)
        }));
        
        setTransactions(newTransactions);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Greška pri dohvaćanju transakcija:', err);
      setError('Greška pri dohvaćanju transakcija');
      setIsLoading(false);
    }
  };
  
  // Dohvaćanje transakcija pri učitavanju komponente i svakih 10 sekundi
  useEffect(() => {
    fetchTransactions();
    
    const intervalId = setInterval(fetchTransactions, 10000);
    
    return () => clearInterval(intervalId);
  }, [address]);
  
  // Funkcija za formatiranje adrese (skraćivanje)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Funkcija za formatiranje datuma
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('hr-HR');
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Zadnje transakcije</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4">
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
        <h2 className="text-xl font-semibold mb-4">Zadnje transakcije</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Zadnje transakcije</h2>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Nema pronađenih transakcija za ovu adresu</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div 
              key={tx.hash}
              className={`border-b border-gray-200 dark:border-gray-700 pb-4 ${
                tx.isNew ? 'animate-pulse bg-blue-50 dark:bg-blue-900/20 p-2 rounded' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Link 
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  {formatAddress(tx.hash)}
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(tx.timestamp)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Od:</p>
                  <Link 
                    href={`/adrese/${tx.from_address}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {formatAddress(tx.from_address)}
                  </Link>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Za:</p>
                  <Link 
                    href={`/adrese/${tx.to}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {formatAddress(tx.to)}
                  </Link>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Vrijednost:</p>
                  <p>{parseFloat(formatEther(tx.value)).toFixed(6)} ETH</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Gas:</p>
                  <p>{tx.gasUsed}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
