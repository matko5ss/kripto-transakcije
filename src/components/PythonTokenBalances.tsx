"use client";

import React, { useState, useEffect } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { getTokenBalances, Token } from '@/services/pythonDuneService';

// Funkcije za formatiranje vrijednosti (zamjena za ethers/lib/utils)
const formatEther = (value: string): string => {
  const wei = BigInt(value);
  const etherValue = Number(wei) / 1e18;
  return etherValue.toString();
};

const formatUnits = (value: string, decimals: number): string => {
  const bigValue = BigInt(value);
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = bigValue / divisor;
  const fractionalPart = bigValue % divisor;
  
  // Formatiranje decimalnog dijela
  let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  // Uklanjanje trailing nula
  fractionalStr = fractionalStr.replace(/0+$/, '');
  
  if (fractionalStr === '') {
    return integerPart.toString();
  }
  
  return `${integerPart}.${fractionalStr}`;
};

interface TokenBalancesProps {
  address: string;
}

interface TokenWithStatus extends Token {
  formattedBalance: string;
  isNew?: boolean;
}

export default function PythonTokenBalances({ address }: TokenBalancesProps) {
  const [tokens, setTokens] = useState<TokenWithStatus[]>([]);
  const [previousTokens, setPreviousTokens] = useState<TokenWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Funkcija za dohvaćanje stanja tokena
  const fetchTokenBalances = async () => {
    try {
      const data = await getTokenBalances(address);
      
      if (data) {
        setPreviousTokens(tokens);
        
        const formattedTokens = data.map(token => {
          const formattedBalance = token.symbol === 'ETH' 
            ? formatEther(token.balance) 
            : formatUnits(token.balance, token.decimals);
            
          return {
            ...token,
            formattedBalance,
          };
        });
        
        // Označavanje novih tokena ili tokena s promijenjenim stanjem
        const newTokens = formattedTokens.map(token => {
          const previousToken = previousTokens.find(t => t.contractAddress === token.contractAddress);
          const isNew = !previousToken || previousToken.balance !== token.balance;
          return { ...token, isNew };
        });
        
        setTokens(newTokens);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Greška pri dohvaćanju stanja tokena:', err);
      setError('Greška pri dohvaćanju stanja tokena');
      setIsLoading(false);
    }
  };
  
  // Dohvaćanje stanja tokena pri učitavanju komponente i svakih 10 sekundi
  useEffect(() => {
    fetchTokenBalances();
    
    const intervalId = setInterval(fetchTokenBalances, 10000);
    
    return () => clearInterval(intervalId);
  }, [address]);
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stanje tokena</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stanje tokena</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Stanje tokena</h2>
      
      {tokens.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Nema pronađenih tokena za ovu adresu</p>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <div 
              key={token.contractAddress}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                token.isNew 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {token.logo ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      <div 
                        className="w-full h-full bg-center bg-cover" 
                        style={{ backgroundImage: `url(${token.logo})` }}
                        aria-label={token.symbol}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaEthereum className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{token.symbol}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{parseFloat(token.formattedBalance).toFixed(6)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
