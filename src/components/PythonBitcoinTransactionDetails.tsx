"use client";

import React, { useState, useEffect } from 'react';
import { FaBitcoin, FaClock, FaExchangeAlt, FaCubes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { BitcoinTransaction } from '@/services/pythonBitcoinService';

interface PythonBitcoinTransactionDetailsProps {
  transactionHash: string;
}

export default function PythonBitcoinTransactionDetails({ transactionHash }: PythonBitcoinTransactionDetailsProps) {
  const [transaction, setTransaction] = useState<BitcoinTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionHash) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Dohvaćamo detalje transakcije iz Python API-ja
        const response = await fetch(`http://localhost:8001/api/bitcoin/transaction/${transactionHash}`);
        
        if (!response.ok) {
          throw new Error(`HTTP greška: ${response.status}`);
        }
        
        const data = await response.json();
        setTransaction(data);
      } catch (err) {
        console.error('Greška pri dohvaćanju detalja transakcije:', err);
        setError('Nije moguće dohvatiti detalje transakcije. Provjerite je li hash ispravan.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactionDetails();
  }, [transactionHash]);

  // Funkcija za formatiranje vremena
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Funkcija za skraćivanje adrese
  const shortenAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          <span className="ml-2 text-lg">Dohvaćanje detalja transakcije...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-red-500 flex items-center justify-center py-4">
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Detalji Bitcoin transakcije</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Osnovne informacije</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Hash</p>
              <p className="font-mono break-all">{transaction.txid}</p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                Potvrđeno ({transaction.confirmations} potvrda)
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Vrijeme i blok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Vrijeme</p>
              <p className="flex items-center">
                <FaClock className="text-blue-500 mr-2" />
                {formatTime(transaction.timestamp)}
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Blok</p>
              <p className="flex items-center">
                <FaCubes className="text-purple-500 mr-2" />
                <a 
                  href={`https://mempool.space/block/${transaction.block_height}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {transaction.block_height}
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Transakcija</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Od</p>
              <p className="flex items-center">
                <FaExchangeAlt className="text-red-500 mr-2" />
                <a 
                  href={`https://mempool.space/address/${transaction.sender}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-mono"
                >
                  {transaction.sender}
                </a>
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Za</p>
              <p className="flex items-center">
                <FaExchangeAlt className="text-green-500 mr-2" />
                <a 
                  href={`https://mempool.space/address/${transaction.recipient}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-mono"
                >
                  {transaction.recipient}
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Vrijednost i naknada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Vrijednost</p>
              <p className="text-xl font-semibold flex items-center">
                <FaBitcoin className="text-orange-500 mr-2" />
                {parseFloat(transaction.value).toFixed(8)} BTC
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Naknada</p>
              <p className="flex items-center">
                <FaBitcoin className="text-orange-500 mr-2" />
                {parseFloat(transaction.fee).toFixed(8)} BTC
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <a 
          href={`https://mempool.space/tx/${transaction.txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Pregledaj na Mempool.space
        </a>
      </div>
    </div>
  );
}
