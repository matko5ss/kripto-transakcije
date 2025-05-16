"use client";

import React, { useState, useEffect } from "react";
import { 
  FaExchangeAlt, 
  FaClock, 
  FaCoins, 
  FaFileInvoiceDollar, 
  FaCubes, 
  FaArrowRight, 
  FaArrowDown, 
  FaArrowUp,
  FaSpinner
} from "react-icons/fa";
import { getBitcoinTransaction } from "@/services/bitcoinRealTimeService";

interface BitcoinTransakcijaDetaljiProps {
  txHash: string | null;
  onClose: () => void;
}

export default function BitcoinTransakcijaDetalji({ txHash, onClose }: BitcoinTransakcijaDetaljiProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    if (!txHash) return;

    const fetchTransactionDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getBitcoinTransaction(txHash);
        if (data) {
          setTransactionData(data);
          console.log("Dohvaćeni detalji transakcije:", data);
        } else {
          setError("Nije moguće dohvatiti detalje transakcije.");
        }
      } catch (err) {
        console.error("Greška pri dohvaćanju detalja transakcije:", err);
        setError("Došlo je do greške pri dohvaćanju detalja transakcije.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [txHash]);

  // Funkcija za skraćivanje hash-a
  const shortenHash = (hash: string) => {
    if (!hash || hash.length <= 16) return hash;
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

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

  // Funkcija za formatiranje iznosa u BTC
  const formatBtcAmount = (amount: string) => {
    try {
      const value = parseFloat(amount);
      if (isNaN(value)) return '0 BTC';
      
      // Za velike iznose (>1000 BTC) prikazujemo s manje decimala
      if (value >= 1000) {
        return `${value.toLocaleString('hr-HR', { maximumFractionDigits: 2 })} BTC`;
      } 
      // Za srednje iznose (>1 BTC) prikazujemo s više decimala
      else if (value >= 1) {
        return `${value.toLocaleString('hr-HR', { maximumFractionDigits: 5 })} BTC`;
      }
      // Za male iznose prikazujemo s 8 decimala
      return `${value.toFixed(8)} BTC`;
    } catch (error) {
      return '0 BTC';
    }
  };

  if (!txHash) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 bg-orange-100 flex justify-between items-center border-b border-orange-200">
          <h2 className="text-xl font-semibold flex items-center text-orange-800">
            <FaExchangeAlt className="mr-2" />
            Detalji Bitcoin transakcije
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
              <span className="text-gray-600">Učitavanje detalja transakcije...</span>
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
          ) : transactionData ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Osnovne informacije</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Hash transakcije:</span>
                    <div className="font-mono text-sm break-all mt-1">{transactionData.hash}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Vrijeme:</span>
                    <div className="font-medium mt-1">{formatTime(transactionData.time)}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Blok:</span>
                    <div className="font-medium mt-1">{transactionData.block_height || "Nije potvrđeno"}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Veličina:</span>
                    <div className="font-medium mt-1">{parseInt(transactionData.size).toLocaleString('hr-HR')} bytes</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Težina:</span>
                    <div className="font-medium mt-1">{parseInt(transactionData.weight).toLocaleString('hr-HR')}</div>
                  </div>
                  <div className="border-b pb-2">
                    <span className="text-gray-500 text-sm">Naknada:</span>
                    <div className="font-medium mt-1">{formatBtcAmount(transactionData.fee)}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sažetak</h3>
                <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white rounded-md shadow-sm">
                  <div className="text-center mb-4 md:mb-0">
                    <div className="text-gray-500 text-sm">Ulazi</div>
                    <div className="text-lg font-semibold">{transactionData.input_count}</div>
                    <div className="text-sm text-gray-600">{formatBtcAmount(transactionData.input_total)}</div>
                  </div>
                  
                  <div className="text-orange-500 text-2xl mb-4 md:mb-0">
                    <FaArrowRight />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">Izlazi</div>
                    <div className="text-lg font-semibold">{transactionData.output_count}</div>
                    <div className="text-sm text-gray-600">{formatBtcAmount(transactionData.output_total)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-gray-50 p-4 rounded-md flex-1">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <FaArrowUp className="mr-2 text-red-500" />
                    Ulazi
                  </h3>
                  <div className="bg-white rounded-md shadow-sm p-2">
                    {/* Ovdje bi prikazali detalje ulaza kada bi bili dostupni */}
                    <div className="text-center text-gray-500 py-4">
                      Detaljni podaci o ulazima nisu dostupni.
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md flex-1">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <FaArrowDown className="mr-2 text-green-500" />
                    Izlazi
                  </h3>
                  <div className="bg-white rounded-md shadow-sm p-2">
                    {/* Ovdje bi prikazali detalje izlaza kada bi bili dostupni */}
                    <div className="text-center text-gray-500 py-4">
                      Detaljni podaci o izlazima nisu dostupni.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <a 
                  href={`https://www.blockchain.com/explorer/transactions/btc/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-md text-sm flex items-center"
                >
                  <FaExchangeAlt className="mr-2" />
                  Pregledaj na Blockchain.com
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-12">
              Nema dostupnih podataka za ovu transakciju.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
