"use client";

import { useEffect, useState, useCallback } from "react";
import { FaBitcoin, FaExchangeAlt, FaCubes, FaNetworkWired } from "react-icons/fa";
import PodaciKartica from "@/components/PodaciKartica";
import { 
  getBitcoinStatus, 
  getBitcoinTransactions, 
  getBitcoinBlocks,
  BitcoinTransaction,
  BitcoinBlock,
  BitcoinStatus
} from "@/services/pythonBitcoinService";
import { dohvatiBitcoinCijenu, BitcoinCijena } from "@/services/bitcoinDune";

export default function BitcoinPage() {
  const [transakcije, setTransakcije] = useState<BitcoinTransaction[]>([]);
  const [blokovi, setBlokovi] = useState<BitcoinBlock[]>([]);
  const [status, setStatus] = useState<BitcoinStatus | null>(null);
  const [cijenaBitcoina, setCijenaBitcoina] = useState<BitcoinCijena | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Funkcija za formatiranje vremena
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  // Funkcija za dohvaćanje podataka
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dohvaćamo podatke paralelno za brže učitavanje
      const [statusData, transactionData, blockData, bitcoinPrice] = await Promise.all([
        getBitcoinStatus(),
        getBitcoinTransactions(10),
        getBitcoinBlocks(5),
        dohvatiBitcoinCijenu() // Dohvaćamo cijenu preko Dune API-ja
      ]);
      
      setStatus(statusData);
      setTransakcije(transactionData);
      setBlokovi(blockData);
      setCijenaBitcoina(bitcoinPrice); // Postavljamo cijenu Bitcoina
      setLastUpdated(formatTime());
    } catch (err) {
      console.error("Greška pri dohvaćanju podataka:", err);
      setError("Došlo je do greške pri dohvaćanju podataka. Pokušajte ponovno kasnije.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicijalno dohvaćanje podataka
  useEffect(() => {
    fetchData();
    
    // Postavljamo intervale za automatsko osvježavanje podataka
    const priceInterval = setInterval(async () => {
      try {
        // Dohvaćamo cijenu Bitcoina preko Dune API-ja
        const bitcoinPrice = await dohvatiBitcoinCijenu();
        setCijenaBitcoina(bitcoinPrice);
        
        // Dohvaćamo ostale podatke o statusu
        const statusData = await getBitcoinStatus();
        setStatus(statusData);
        
        setLastUpdated(formatTime());
      } catch (err) {
        console.error("Greška pri osvježavanju cijene:", err);
      }
    }, 30000); // Svakih 30 sekundi osvježavamo cijenu za ažurne podatke
    
    const dataInterval = setInterval(() => {
      fetchData();
    }, 30000); // Svakih 30 sekundi osvježavamo sve podatke
    
    // Čistimo intervale pri unmountanju komponente
    return () => {
      clearInterval(priceInterval);
      clearInterval(dataInterval);
    };
  }, [fetchData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FaBitcoin className="text-orange-500 mr-2" /> Bitcoin Explorer
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Pokušaj ponovno
          </button>
        </div>
      )}
      
      <div className="mb-4 text-sm text-gray-600">
        Zadnje osvježeno: {lastUpdated || "Nikad"}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Cijena Bitcoina (Dune API)</h2>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <FaBitcoin className="text-orange-500 text-4xl" />
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-orange-500">
                  {cijenaBitcoina !== null ? 
                    `$${cijenaBitcoina.usd.toLocaleString('hr-HR', { maximumFractionDigits: 2 })}` : 
                    "Dohvaćanje podataka..."}
                </p>
                <p className="text-xl font-semibold text-blue-500 mt-1">
                  {cijenaBitcoina !== null ? 
                    `€${cijenaBitcoina.eur.toLocaleString('hr-HR', { maximumFractionDigits: 2 })}` : 
                    ""}
                </p>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              <span className="mr-2">Osvježava se svakih 30s</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Zadnje osvježeno: {lastUpdated}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Izvor: Dune Analytics API (ID: 5132855)
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PodaciKartica
            naslov="Zadnji blok"
            vrijednost={status?.last_block.toString() || "Učitavanje..."}
            ikona={<FaCubes className="text-bitcoin" />}
            loading={loading}
          />
          <PodaciKartica
            naslov="Transakcije danas"
            vrijednost={status?.transactions_count.toLocaleString() || "Učitavanje..."}
            ikona={<FaExchangeAlt className="text-bitcoin" />}
            loading={loading}
          />
          <PodaciKartica
            naslov="Prosječna naknada (sat/vB)"
            vrijednost={status?.fee_rate.toString() || "Učitavanje..."}
            ikona={<FaNetworkWired className="text-bitcoin" />}
            loading={loading}
          />
          <PodaciKartica
            naslov="Hashrate"
            vrijednost={status ? `${(status.hashrate / 1e18).toFixed(1)} EH/s` : "Učitavanje..."}
            ikona={<FaBitcoin className="text-bitcoin" />}
            loading={loading}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pretraži Bitcoin blockchain</h2>
        <div className="bg-white rounded-lg shadow-md p-4">
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Unesite adresu, hash transakcije ili visinu bloka"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-bitcoin"
            />
            <button 
              type="submit"
              className="bg-bitcoin hover:bg-bitcoin-dark text-white px-6 py-3 rounded"
            >
              Pretraži
            </button>
          </form>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Zadnji blokovi</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-4 text-left">Hash</th>
                <th className="py-3 px-4 text-left">Visina</th>
                <th className="py-3 px-4 text-left">Vrijeme</th>
                <th className="py-3 px-4 text-left">Veličina</th>
                <th className="py-3 px-4 text-left">Br. transakcija</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : (
                blokovi.map((blok) => (
                  <tr key={blok.hash} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a href={`/bitcoin/block/${blok.hash}`} className="text-blue-500 hover:underline">
                        {`${blok.hash.substring(0, 10)}...${blok.hash.substring(blok.hash.length - 10)}`}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`/bitcoin/block/${blok.height}`} className="text-blue-500 hover:underline">
                        {blok.height}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(blok.timestamp * 1000).toLocaleString('hr-HR')}
                    </td>
                    <td className="py-3 px-4">
                      {blok.size.toLocaleString('hr-HR')} bytes
                    </td>
                    <td className="py-3 px-4">
                      {blok.tx_count.toLocaleString('hr-HR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Zadnje transakcije</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-4 text-left">Hash</th>
                <th className="py-3 px-4 text-left">Vrijeme</th>
                <th className="py-3 px-4 text-left">Iznos (BTC)</th>
                <th className="py-3 px-4 text-left">Naknada (BTC)</th>
                <th className="py-3 px-4 text-left">Blok</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
                  </tr>
                ))
              ) : (
                transakcije.map((tx) => (
                  <tr key={tx.txid} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a href={`/bitcoin/tx/${tx.txid}`} className="text-blue-500 hover:underline">
                        {`${tx.txid.substring(0, 10)}...${tx.txid.substring(tx.txid.length - 10)}`}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(tx.timestamp * 1000).toLocaleString('hr-HR')}
                    </td>
                    <td className="py-3 px-4">
                      {parseFloat(tx.value).toFixed(8)}
                    </td>
                    <td className="py-3 px-4">
                      {parseFloat(tx.fee).toFixed(8)}
                    </td>
                    <td className="py-3 px-4">
                      <a href={`/bitcoin/block/${tx.block_height}`} className="text-blue-500 hover:underline">
                        {tx.block_height}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
