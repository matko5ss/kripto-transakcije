"use client";

import React, { useState, useEffect } from "react";
import { 
  FaCubes, 
  FaClock, 
  FaExchangeAlt, 
  FaDatabase, 
  FaServer, 
  FaLink,
  FaHashtag,
  FaCode,
  FaSpinner
} from "react-icons/fa";
import { getBitcoinBlock } from "@/services/bitcoinRealTimeService";

interface BitcoinBlokDetaljiProps {
  blockHash: string | null;
  onClose: () => void;
}

export default function BitcoinBlokDetalji({ blockHash, onClose }: BitcoinBlokDetaljiProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [blockData, setBlockData] = useState<any>(null);

  useEffect(() => {
    if (!blockHash) return;

    const fetchBlockDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getBitcoinBlock(blockHash);
        if (data) {
          setBlockData(data);
          console.log("Dohvaćeni detalji bloka:", data);
        } else {
          setError("Nije moguće dohvatiti detalje bloka.");
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju detalja bloka:", err);
        setError("Došlo je do greške pri dohvaćanju detalja bloka.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockDetails();
  }, [blockHash]);

  // Funkcija za formatiranje vremena
  const formatTime = (timeString: string) => {
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
      return timeString;
    }
  };

  // Funkcija za formatiranje veličine bloka
  const formatSize = (sizeStr: string) => {
    const size = parseInt(sizeStr);
    if (isNaN(size)) return '0 B';
    
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  if (!blockHash) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 bg-orange-100 flex justify-between items-center border-b border-orange-200">
          <h2 className="text-xl font-semibold flex items-center text-orange-800">
            <FaCubes className="mr-2" />
            Detalji Bitcoin bloka
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FaSpinner className="animate-spin text-orange-500 text-3xl mr-3" />
              <span className="text-gray-600">Učitavanje detalja bloka...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <p>{error}</p>
              <button 
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm"
                onClick={onClose}
              >
                Zatvori
              </button>
            </div>
          ) : blockData ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-orange-50 p-4 rounded-md flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-orange-500 mb-2">
                      {blockData.height}
                    </div>
                    <div className="text-gray-500">Visina bloka</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-500 mb-2 flex items-center justify-center">
                      <FaExchangeAlt className="mr-2" />
                      {blockData.transaction_count}
                    </div>
                    <div className="text-gray-500">Transakcije</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-500 mb-2">
                      {formatSize(blockData.size)}
                    </div>
                    <div className="text-gray-500">Veličina</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Osnovne informacije</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Hash bloka:</span>
                    <div className="font-mono text-sm break-all mt-1">{blockData.hash}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Vrijeme:</span>
                    <div className="font-medium mt-1">{formatTime(blockData.time)}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Težina:</span>
                    <div className="font-medium mt-1">{parseInt(blockData.weight || '0').toLocaleString('hr-HR')}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Veličina:</span>
                    <div className="font-medium mt-1">{parseInt(blockData.size).toLocaleString('hr-HR')} bytes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Tehnički detalji</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm flex items-center">
                      <FaLink className="mr-1" /> Prethodni blok:
                    </span>
                    <div className="font-mono text-xs break-all mt-1 text-blue-600">
                      {blockData.previousBlockHash || "Nije dostupno"}
                    </div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm flex items-center">
                      <FaLink className="mr-1" /> Sljedeći blok:
                    </span>
                    <div className="font-mono text-xs break-all mt-1 text-blue-600">
                      {blockData.nextBlockHash || "Nije dostupno"}
                    </div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm flex items-center">
                      <FaHashtag className="mr-1" /> Merkle root:
                    </span>
                    <div className="font-mono text-xs break-all mt-1">
                      {blockData.merkleRoot || "Nije dostupno"}
                    </div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm flex items-center">
                      <FaCode className="mr-1" /> Verzija:
                    </span>
                    <div className="font-medium mt-1">
                      {blockData.version || "Nije dostupno"}
                    </div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Bits:</span>
                    <div className="font-medium mt-1">
                      {blockData.bits || "Nije dostupno"}
                    </div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Nonce:</span>
                    <div className="font-medium mt-1">
                      {blockData.nonce || "Nije dostupno"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <a 
                  href={`https://www.blockchain.com/explorer/blocks/btc/${blockData.hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-md text-sm flex items-center"
                >
                  <FaCubes className="mr-2" />
                  Pregledaj na Blockchain.com
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-12">
              Nema dostupnih podataka za ovaj blok.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
