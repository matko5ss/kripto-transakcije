"use client";

import React, { useState } from 'react';
import { FaSearch, FaExclamationTriangle } from 'react-icons/fa';

interface PythonBitcoinTransactionSearchProps {
  onSearch: (hash: string) => void;
}

export default function PythonBitcoinTransactionSearch({ onSearch }: PythonBitcoinTransactionSearchProps) {
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Funkcija za validaciju Bitcoin transaction hash-a
  const validateTransactionHash = (hash: string): boolean => {
    // Bitcoin transaction hash mora biti 64 znaka dug heksadecimalni string
    const hexRegex = /^[0-9a-fA-F]{64}$/;
    return hexRegex.test(hash);
  };

  // Funkcija za obradu pretrage
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Provjeri je li hash validan
    if (!validateTransactionHash(transactionHash)) {
      setError('Bitcoin transaction hash mora biti 64 znaka dug heksadecimalni string.');
      return;
    }
    
    // Resetiraj grešku i pozovi callback za pretragu
    setError(null);
    onSearch(transactionHash);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Pretraži Bitcoin transakciju</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="transaction-hash" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Hash
          </label>
          <div className="relative">
            <input
              id="transaction-hash"
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              placeholder="Unesite Bitcoin transaction hash za pretraživanje detalja transakcije"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaSearch />
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Bitcoin transaction hash mora biti 64 znaka dug heksadecimalni string.
          </p>
        </div>
      </form>
    </div>
  );
}
