"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaBitcoin, FaExchangeAlt, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa';
import { getBitcoinAddressInfo, BitcoinAddressInfo } from '@/services/pythonBitcoinService';

interface PythonBitcoinAddressInfoProps {
  address: string;
}

export default function PythonBitcoinAddressInfo({ address }: PythonBitcoinAddressInfoProps) {
  const [addressInfo, setAddressInfo] = useState<BitcoinAddressInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcija za dohvaćanje informacija o adresi
  const fetchAddressInfo = useCallback(async () => {
    try {
      const data = await getBitcoinAddressInfo(address);
      
      if (data) {
        setAddressInfo(data);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Greška:', err);
      setError('Greška pri dohvaćanju informacija o Bitcoin adresi');
      setIsLoading(false);
    }
  }, [address]);
  
  // Dohvaćamo podatke pri učitavanju komponente i svakih 30 sekundi
  useEffect(() => {
    fetchAddressInfo();
    
    const interval = setInterval(() => {
      fetchAddressInfo();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAddressInfo]);
  
  // Funkcija za formatiranje datuma
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('hr-HR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Informacije o adresi</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Informacije o adresi</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!addressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4">Informacije o adresi</h2>
        <p className="text-gray-500 dark:text-gray-400">Nema dostupnih informacija za ovu adresu.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Informacije o adresi</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Adresa</p>
        <p className="break-all font-mono">{addressInfo.address}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stanje</p>
          <p className="text-xl font-semibold flex items-center">
            <FaBitcoin className="text-orange-500 mr-1" />
            {parseFloat(addressInfo.balance).toFixed(8)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Broj transakcija</p>
          <p className="text-xl font-semibold flex items-center">
            <FaExchangeAlt className="text-purple-500 mr-1" />
            {addressInfo.tx_count.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ukupno primljeno</p>
          <p className="text-lg font-semibold flex items-center">
            <FaArrowDown className="text-green-500 mr-1" />
            <FaBitcoin className="text-orange-500 mr-1" />
            {parseFloat(addressInfo.total_received).toFixed(8)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ukupno poslano</p>
          <p className="text-lg font-semibold flex items-center">
            <FaArrowUp className="text-red-500 mr-1" />
            <FaBitcoin className="text-orange-500 mr-1" />
            {parseFloat(addressInfo.total_sent).toFixed(8)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prvi put viđeno</p>
          <p className="flex items-center">
            <FaClock className="text-blue-500 mr-1" />
            {formatDate(addressInfo.first_seen)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Zadnji put viđeno</p>
          <p className="flex items-center">
            <FaClock className="text-blue-500 mr-1" />
            {formatDate(addressInfo.last_seen)}
          </p>
        </div>
      </div>
    </div>
  );
}
