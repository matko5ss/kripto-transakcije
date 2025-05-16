"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaExchangeAlt, FaClock, FaCoins, FaFileInvoiceDollar, FaArrowRight, FaInfoCircle } from "react-icons/fa";
import { BitcoinRealTimeTransaction } from "@/services/bitcoinRealTimeService";

interface BitcoinTransakcijeTabela2Props {
  transactions: BitcoinRealTimeTransaction[];
  loading: boolean;
  onTransactionClick?: (txHash: string) => void;
}

export default function BitcoinTransakcijeTabela2({ 
  transactions, 
  loading, 
  onTransactionClick 
}: BitcoinTransakcijeTabela2Props) {
  const [animatedRows, setAnimatedRows] = useState<string[]>([]);
  const [previousTxHashes, setPreviousTxHashes] = useState<string[]>([]);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  // Efekt za praćenje novih transakcija i dodavanje animacije
  useEffect(() => {
    if (transactions.length > 0) {
      const currentTxHashes = transactions.map(tx => tx.hash);
      const newTxHashes = currentTxHashes.filter(hash => !previousTxHashes.includes(hash));
      
      if (newTxHashes.length > 0 && previousTxHashes.length > 0) {
        setAnimatedRows(newTxHashes);
        
        // Uklanjamo animaciju nakon 2 sekunde
        setTimeout(() => {
          setAnimatedRows([]);
        }, 2000);
      }
      
      setPreviousTxHashes(currentTxHashes);
    }
  }, [transactions, previousTxHashes]);

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

  // Funkcija za skraćivanje hash-a
  const shortenHash = useCallback((hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  }, []);

  // Funkcija za formatiranje iznosa u BTC
  const formatBtcAmount = useCallback((amount: string) => {
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
      console.error('Greška pri formatiranju BTC iznosa:', error);
      return '0 BTC';
    }
  }, []);

  // Funkcija za izračun klase boje ovisno o iznosu naknade
  const getFeeColorClass = useCallback((fee: string) => {
    try {
      const feeValue = parseFloat(fee);
      if (isNaN(feeValue)) return 'text-gray-500';
      
      if (feeValue >= 0.001) return 'text-red-500'; // Visoka naknada
      if (feeValue >= 0.0001) return 'text-orange-500'; // Srednja naknada
      return 'text-green-500'; // Niska naknada
    } catch (error) {
      return 'text-gray-500';
    }
  }, []);

  // Funkcija za rukovanje klikom na transakciju
  const handleTxClick = useCallback((txHash: string) => {
    setSelectedTx(txHash === selectedTx ? null : txHash);
    if (onTransactionClick) {
      onTransactionClick(txHash);
    }
  }, [selectedTx, onTransactionClick]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <style jsx>{`
        @keyframes fadeInYellow {
          0% { background-color: rgba(254, 240, 138, 0.8); }
          100% { background-color: transparent; }
        }
        .new-tx-animation {
          animation: fadeInYellow 2s ease-out;
        }
        .tx-row:hover {
          background-color: rgba(243, 244, 246, 0.5);
          cursor: pointer;
        }
        .selected-tx {
          background-color: rgba(219, 234, 254, 0.5);
          border-left: 3px solid #3b82f6;
        }
      `}</style>
      
      {loading && transactions.length === 0 ? (
        <div className="flex justify-center items-center p-8 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bitcoin"></div>
          <span className="ml-3 text-gray-600 font-medium">Učitavanje transakcija...</span>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-bitcoin" />
                  Hash transakcije
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FaClock className="mr-2 text-bitcoin" />
                  Vrijeme
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FaCoins className="mr-2 text-bitcoin" />
                  Iznos
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FaFileInvoiceDollar className="mr-2 text-bitcoin" />
                  Naknada
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <FaInfoCircle className="mr-2 text-bitcoin" />
                  Detalji
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FaExchangeAlt className="text-gray-300 text-3xl mb-2" />
                    <p>Nema dostupnih transakcija</p>
                    <p className="text-sm text-gray-400 mt-1">Transakcije će se pojaviti kada budu dostupne</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr 
                  key={tx.hash} 
                  className={`tx-row transition-all duration-300 ${animatedRows.includes(tx.hash) ? 'new-tx-animation' : ''} ${selectedTx === tx.hash ? 'selected-tx' : ''}`}
                  onClick={() => handleTxClick(tx.hash)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-bitcoin">
                      {shortenHash(tx.hash)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatTime(tx.time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatBtcAmount(tx.input_total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {`${tx.input_count} ulaz${parseInt(tx.input_count) !== 1 ? 'a' : ''} / ${tx.output_count} izlaz${parseInt(tx.output_count) !== 1 ? 'a' : ''}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getFeeColorClass(tx.fee)}`}>
                      {formatBtcAmount(tx.fee)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {`${parseInt(tx.size).toLocaleString('hr-HR')} bytes`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-bitcoin hover:text-orange-600 transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTxClick(tx.hash);
                      }}
                    >
                      <FaArrowRight />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
