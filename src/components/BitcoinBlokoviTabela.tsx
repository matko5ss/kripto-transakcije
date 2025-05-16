"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCubes, FaExchangeAlt, FaDatabase, FaChevronRight } from "react-icons/fa";
import { BiTimer } from "react-icons/bi";
import { RiCoinFill } from "react-icons/ri";
import { BitcoinRealTimeBlock } from "@/services/bitcoinRealTimeService";
import Link from "next/link";

interface BitcoinBlokoviTabelaProps {
  blocks: BitcoinRealTimeBlock[];
  loading: boolean;
  onBlockClick?: (blockHash: string) => void;
}

export default function BitcoinBlokoviTabela({ 
  blocks, 
  loading, 
  onBlockClick 
}: BitcoinBlokoviTabelaProps) {
  const [animatedRows, setAnimatedRows] = useState<string[]>([]);
  const [previousBlockHashes, setPreviousBlockHashes] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Efekt za praćenje novih blokova i dodavanje animacije
  useEffect(() => {
    if (blocks.length > 0) {
      const currentBlockHashes = blocks.map(block => block.hash);
      const newBlockHashes = currentBlockHashes.filter(hash => !previousBlockHashes.includes(hash));
      
      if (newBlockHashes.length > 0 && previousBlockHashes.length > 0) {
        setAnimatedRows(newBlockHashes);
        
        // Uklanjamo animaciju nakon 2 sekunde
        setTimeout(() => {
          setAnimatedRows([]);
        }, 2000);
      }
      
      setPreviousBlockHashes(currentBlockHashes);
    }
  }, [blocks, previousBlockHashes]);

  // Funkcija za formatiranje vremena
  const formatTime = useCallback((timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Greška pri formatiranju vremena:', error);
      return timeString;
    }
  }, []);

  // Funkcija za formatiranje vremena kao "prije X minuta"
  const formatTimeAgo = useCallback((timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) {
        return `prije ${diffSec} sekundi`;
      }
      
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return `prije ${diffMin} minuta`;
      }
      
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) {
        return `prije ${diffHour} sati`;
      }
      
      const diffDay = Math.floor(diffHour / 24);
      return `prije ${diffDay} dana`;
    } catch (error) {
      console.error('Greška pri formatiranju vremena:', error);
      return timeString;
    }
  }, []);

  // Funkcija za skraćivanje hash-a
  const shortenHash = useCallback((hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  }, []);

  // Funkcija za formatiranje veličine bloka
  const formatSize = useCallback((sizeStr: string) => {
    const size = parseInt(sizeStr);
    if (isNaN(size)) return '0 B';
    
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  }, []);

  // Funkcija za rukovanje klikom na blok
  const handleBlockClick = useCallback((blockHash: string) => {
    setSelectedBlock(blockHash === selectedBlock ? null : blockHash);
    if (onBlockClick) {
      onBlockClick(blockHash);
    }
  }, [selectedBlock, onBlockClick]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <style jsx>{`
        @keyframes fadeInBlue {
          0% { background-color: rgba(247, 147, 26, 0.2); }
          100% { background-color: transparent; }
        }
        .new-block-animation {
          animation: fadeInBlue 2s ease-out;
        }
        .block-card:hover {
          background-color: rgba(247, 147, 26, 0.05);
          cursor: pointer;
        }
        .selected-block {
          background-color: rgba(247, 147, 26, 0.1);
          border-left: 3px solid #f7931a;
        }
        .bitcoin-gradient {
          background: linear-gradient(90deg, #f7931a 0%, #f9b05c 100%);
        }
      `}</style>
      
      {loading && blocks.length === 0 ? (
        <div className="flex justify-center items-center p-8 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bitcoin"></div>
          <span className="ml-3 text-gray-600 font-medium">Učitavanje blokova...</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 uppercase">Zadnji blokovi</h3>
          </div>
          
          {blocks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <FaCubes className="text-gray-300 text-3xl mb-2" />
                <p>Nema dostupnih blokova</p>
                <p className="text-sm text-gray-400 mt-1">Blokovi će se pojaviti kada budu dostupni</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {blocks.map((block) => (
                <div 
                  key={block.hash} 
                  className={`block-card p-4 transition-all duration-300 ${animatedRows.includes(block.hash) ? 'new-block-animation' : ''} ${selectedBlock === block.hash ? 'selected-block' : ''}`}
                  onClick={() => handleBlockClick(block.hash)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bitcoin-gradient text-white rounded-md">
                        <FaCubes className="text-lg" />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-bitcoin">
                            Blok #{block.height}
                          </div>
                          <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            <BiTimer className="inline mr-1" />{formatTimeAgo(block.time)}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 font-mono">
                          {shortenHash(block.hash)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500">
                        {formatTime(block.time)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <FaExchangeAlt className="mr-1 text-gray-400" /> Transakcije
                      </div>
                      <div className="text-sm font-medium">
                        {parseInt(block.transaction_count).toLocaleString('hr-HR')}
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <FaDatabase className="mr-1 text-gray-400" /> Veličina
                      </div>
                      <div className="text-sm font-medium">
                        {formatSize(block.size)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="text-xs text-gray-500 mb-1 flex items-center">
                        <RiCoinFill className="mr-1 text-gray-400" /> Nagrada
                      </div>
                      <div className="text-sm font-medium">
                        6.25 BTC
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs flex justify-end">
                    <button className="text-bitcoin hover:text-orange-600 flex items-center">
                      Detalji bloka <FaChevronRight className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="p-3 text-center">
                <Link href="/bitcoin/blocks" className="text-bitcoin hover:text-orange-600 text-sm font-medium">
                  Prikaži sve blokove
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
