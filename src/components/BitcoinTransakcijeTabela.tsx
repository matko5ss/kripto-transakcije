"use client";

import { useState, useEffect } from "react";
import { FaExchangeAlt, FaCube, FaAngleDoubleRight } from "react-icons/fa";
import Link from "next/link";
import { BitcoinTransakcija, BitcoinBlok } from "@/services/bitcoinDune";
import { formatHash, formatSize, formatAge } from "../utils/format";

interface BitcoinTransakcijeTabelaProps {
  transakcije: BitcoinTransakcija[];
  blokovi?: BitcoinBlok[];
  naslov?: React.ReactNode;
}

export default function BitcoinTransakcijeTabela({
  transakcije,
  blokovi = [],
  naslov,
}: BitcoinTransakcijeTabelaProps) {
  const [aktivnaTabela, setAktivnaTabela] = useState<"transakcije" | "blokovi">("transakcije");
  const [novaTransakcija, setNovaTransakcija] = useState<string | null>(null);
  const [noviBlok, setNoviBlok] = useState<string | null>(null);
  const [prethodneTransakcije, setPrethodneTransakcije] = useState<string[]>([]);
  const [prethodniBlokovi, setPrethodniBlokovi] = useState<string[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Funkcija za praćenje novih transakcija i blokova
  useEffect(() => {
    if (transakcije.length > 0) {
      const noveTxIds = transakcije.map((tx) => tx.txid);
      
      // Provjeri ima li novih transakcija
      if (prethodneTransakcije.length > 0) {
        const noveTransakcije = noveTxIds.filter(
          (txid) => !prethodneTransakcije.includes(txid)
        );
        
        if (noveTransakcije.length > 0) {
          console.log("Nove Bitcoin transakcije:", noveTransakcije);
          setNovaTransakcija(noveTransakcije[0]);
          
          // Resetiraj animaciju nakon 3 sekunde
          setTimeout(() => {
            setNovaTransakcija(null);
          }, 3000);
        }
      }
      
      setPrethodneTransakcije(noveTxIds);
    }
    
    if (blokovi && blokovi.length > 0) {
      const noviBlockIds = blokovi.map((blok) => blok.height);
      
      // Provjeri ima li novih blokova
      if (prethodniBlokovi.length > 0) {
        const noviBlokovi = noviBlockIds.filter(
          (visina) => !prethodniBlokovi.includes(visina)
        );
        
        if (noviBlokovi.length > 0) {
          console.log("Novi Bitcoin blokovi:", noviBlokovi);
          setNoviBlok(noviBlokovi[0]);
          
          // Resetiraj animaciju nakon 3 sekunde
          setTimeout(() => {
            setNoviBlok(null);
          }, 3000);
        }
      }
      
      setPrethodniBlokovi(noviBlockIds);
    }
  }, [transakcije, blokovi, prethodneTransakcije, prethodniBlokovi]);

  // Automatska izmjena između tabela svakih 15 sekundi
  useEffect(() => {
    // Čistimo postojeći interval ako postoji
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Postavljamo novi interval
    const id = setInterval(() => {
      setAktivnaTabela((prev) => (prev === "transakcije" ? "blokovi" : "transakcije"));
    }, 15000); // Izmjena svakih 15 sekundi

    setIntervalId(id);

    // Čišćenje intervala kada se komponenta unmount-a
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Funkcija za skraćivanje hash-a
  const kratiHash = (hash: string) => {
    if (!hash) return "";
    return formatHash(hash);
  };

  // Funkcija za prikaz veličine bloka u KB ili MB
  const formatirajVelicinuBloka = (velicina: string) => {
    return formatSize(velicina);
  };

  // Funkcija za izračun starosti bloka
  const izracunajStarostBloka = (time: string) => {
    const timestamp = parseInt(time) * 1000; // Pretvaramo UNIX timestamp u milisekunde
    const sada = Date.now();
    const razlikaUSekundama = Math.floor((sada - timestamp) / 1000);
    
    return formatAge(razlikaUSekundama);
  };

  // Dinamički postavljamo naslov
  const tabelaNaslov = naslov || (
    <div className="flex items-center space-x-2">
      <span>Najnovije </span>
      {aktivnaTabela === "transakcije" ? (
        <span className="flex items-center">
          <FaExchangeAlt className="text-orange-500 mr-1" />
          Transakcije
        </span>
      ) : (
        <span className="flex items-center">
          <FaCube className="text-green-500 mr-1" />
          Blokovi
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">{tabelaNaslov}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setAktivnaTabela("transakcije")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              aktivnaTabela === "transakcije"
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              <FaExchangeAlt className="mr-1" />
              Transakcije
            </span>
          </button>
          
          <button
            onClick={() => setAktivnaTabela("blokovi")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              aktivnaTabela === "blokovi"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              <FaCube className="mr-1" />
              Blokovi
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {aktivnaTabela === "transakcije" ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tx Hash
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Blok
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Od
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <span className="flex items-center">
                    <FaAngleDoubleRight className="mr-1" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prema
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vrijednost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Naknada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transakcije.map((tx) => (
                <tr
                  key={tx.txid}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    novaTransakcija === tx.txid
                      ? "animate-pulse bg-yellow-50 dark:bg-yellow-900/30"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/bitcoin/tx/${tx.txid}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {kratiHash(tx.txid)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/bitcoin/blok/${tx.blockHeight}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {tx.blockHeight}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/bitcoin/adresa/${tx.senderAddress}`}
                      className="text-gray-600 dark:text-gray-300 hover:underline"
                    >
                      {kratiHash(tx.senderAddress)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <FaAngleDoubleRight className="text-gray-400 dark:text-gray-500 inline-block" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {tx.recipientAddresses && tx.recipientAddresses.length > 0 ? (
                      <Link
                        href={`/bitcoin/adresa/${tx.recipientAddresses[0]}`}
                        className="text-gray-600 dark:text-gray-300 hover:underline"
                      >
                        {kratiHash(tx.recipientAddresses[0])}
                        {tx.recipientAddresses.length > 1 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            +{tx.recipientAddresses.length - 1}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900 dark:text-gray-100">
                    {parseFloat(tx.value).toFixed(8)} BTC
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {parseFloat(tx.fee).toFixed(8)} BTC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Blok
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hash
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Starost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transakcije
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Veličina
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {blokovi.map((blok) => (
                <tr
                  key={blok.height}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    noviBlok === blok.height
                      ? "animate-pulse bg-green-50 dark:bg-green-900/30"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/bitcoin/blok/${blok.height}`}
                      className="text-green-600 dark:text-green-400 hover:underline font-medium"
                    >
                      {blok.height}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/bitcoin/blok/${blok.height}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {kratiHash(blok.hash)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {izracunajStarostBloka(blok.time)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {parseInt(blok.txCount).toLocaleString('hr-HR')}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-gray-500 dark:text-gray-400">
                    {formatirajVelicinuBloka(blok.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <Link
          href={`/bitcoin/${aktivnaTabela === "transakcije" ? "transakcije" : "blokovi"}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Prikaži sve {aktivnaTabela === "transakcije" ? "transakcije" : "blokove"} →
        </Link>
      </div>
    </div>
  );
}
