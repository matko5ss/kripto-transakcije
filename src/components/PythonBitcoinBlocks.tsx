"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaCubes, FaHashtag, FaClock } from 'react-icons/fa';
import { getBitcoinBlocks, BitcoinBlock } from '@/services/pythonBitcoinService';

interface PythonBitcoinBlocksProps {
  limit?: number;
}

export default function PythonBitcoinBlocks({ limit = 5 }: PythonBitcoinBlocksProps) {
  const [blocks, setBlocks] = useState<BitcoinBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBlocks, setNewBlocks] = useState<string[]>([]);

  // Funkcija za dohvaćanje blokova
  const fetchBlocks = useCallback(async () => {
    try {
      const data = await getBitcoinBlocks(limit);
      
      if (data && data.length > 0) {
        // Provjeravamo ima li novih blokova
        const currentBlockHashes = blocks.map(block => block.hash);
        const newBlockHashes = data.filter(block => !currentBlockHashes.includes(block.hash)).map(block => block.hash);
        
        setNewBlocks(newBlockHashes);
        setBlocks(data);
        
        // Resetiramo animaciju nakon 3 sekunde
        if (newBlockHashes.length > 0) {
          setTimeout(() => {
            setNewBlocks([]);
          }, 3000);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Greška:', err);
      setError('Greška pri dohvaćanju Bitcoin blokova');
      setIsLoading(false);
    }
  }, [blocks, limit]);
  
  // Dohvaćamo podatke pri učitavanju komponente i svakih 10 sekundi
  useEffect(() => {
    fetchBlocks();
    
    const interval = setInterval(() => {
      fetchBlocks();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchBlocks]);
  
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
  
  // Funkcija za skraćivanje hash-a
  const shortenHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };
  
  // Funkcija za formatiranje veličine
  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Zadnji Bitcoin blokovi</h2>
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
        <h2 className="text-xl font-semibold mb-4">Zadnji Bitcoin blokovi</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Zadnji Bitcoin blokovi</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 text-left">Visina</th>
              <th className="py-2 px-4 text-left">Hash</th>
              <th className="py-2 px-4 text-left">Vrijeme</th>
              <th className="py-2 px-4 text-left">Rudar</th>
              <th className="py-2 px-4 text-right">Veličina</th>
              <th className="py-2 px-4 text-right">Broj transakcija</th>
              <th className="py-2 px-4 text-right">Težina</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr 
                key={block.hash} 
                className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  newBlocks.includes(block.hash) ? 'bg-yellow-50 dark:bg-yellow-900/20 animate-pulse' : ''
                }`}
              >
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/block/${block.height}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center"
                  >
                    <FaCubes className="mr-1 text-blue-500" />
                    {block.height}
                  </a>
                </td>
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/block/${block.hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center"
                  >
                    <FaHashtag className="mr-1 text-green-500" />
                    {shortenHash(block.hash)}
                  </a>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    <FaClock className="mr-1 text-gray-500" />
                    {formatTime(block.timestamp)}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <a 
                    href={`https://mempool.space/address/${block.miner}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {shortenHash(block.miner)}
                  </a>
                </td>
                <td className="py-2 px-4 text-right">{formatSize(block.size)}</td>
                <td className="py-2 px-4 text-right">{block.tx_count.toLocaleString()}</td>
                <td className="py-2 px-4 text-right">{block.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
