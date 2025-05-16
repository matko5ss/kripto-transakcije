"use client";

import { useEffect, useState, useCallback } from "react";
import { FaBitcoin, FaExchangeAlt, FaCubes, FaNetworkWired } from "react-icons/fa";
import PodaciKartica from "@/components/PodaciKartica";
import BitcoinSearch from "@/components/BitcoinSearch";
import BitcoinCijenaGrafikon from "@/components/BitcoinCijenaGrafikon";
import BitcoinTransakcijeTabela2 from "@/components/BitcoinTransakcijeTabela2";
import BitcoinTransakcijaDetalji from "@/components/BitcoinTransakcijaDetalji";
import BitcoinBlokoviTabela from "@/components/BitcoinBlokoviTabela";
import BitcoinBlokDetalji from "@/components/BitcoinBlokDetalji";
import {
  getBitcoinPrice,
  getBitcoinStats,
  getLatestBitcoinBlocks,
  getLatestBitcoinTransactions,
  BitcoinRealTimePrice,
  BitcoinRealTimeStats,
  BitcoinRealTimeBlock,
  BitcoinRealTimeTransaction
} from "@/services/bitcoinRealTimeService";

export default function BitcoinPage() {
  const [bitcoinPrice, setBitcoinPrice] = useState<BitcoinRealTimePrice | null>(null);
  const [bitcoinStats, setBitcoinStats] = useState<BitcoinRealTimeStats | null>(null);
  const [bitcoinBlocks, setBitcoinBlocks] = useState<BitcoinRealTimeBlock[]>([]);
  const [bitcoinTransactions, setBitcoinTransactions] = useState<BitcoinRealTimeTransaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // Stanja učitavanja za pojedine komponente
  const [loadingPrice, setLoadingPrice] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingBlocks, setLoadingBlocks] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  
  // Stanje za prikaz detalja transakcije i bloka
  const [selectedTransactionHash, setSelectedTransactionHash] = useState<string | null>(null);
  const [selectedBlockHash, setSelectedBlockHash] = useState<string | null>(null);
  
  // Funkcija za formatiranje vremena
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  // Funkcija za dohvaćanje cijene Bitcoina
  const fetchPrice = useCallback(async () => {
    try {
      setLoadingPrice(true);
      const price = await getBitcoinPrice();
      setBitcoinPrice(price);
      console.log('Dohvaćena cijena Bitcoina:', price);
    } catch (err) {
      console.error("Greška pri dohvaćanju cijene Bitcoina:", err);
      setError("Nije moguće dohvatiti cijenu Bitcoina. Pokušajte ponovno kasnije.");
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  // Funkcija za dohvaćanje statistika Bitcoina
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const stats = await getBitcoinStats();
      setBitcoinStats(stats);
      console.log('Dohvaćene statistike Bitcoina:', stats);
    } catch (err) {
      console.error("Greška pri dohvaćanju statistika Bitcoina:", err);
      setError("Nije moguće dohvatiti statistike Bitcoina. Pokušajte ponovno kasnije.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Funkcija za dohvaćanje zadnjih blokova
  const fetchBlocks = useCallback(async () => {
    try {
      setLoadingBlocks(true);
      const blocks = await getLatestBitcoinBlocks(5); // Dohvaćamo zadnjih 5 blokova
      setBitcoinBlocks(blocks);
      console.log('Dohvaćeni zadnji Bitcoin blokovi:', blocks);
    } catch (err) {
      console.error("Greška pri dohvaćanju zadnjih Bitcoin blokova:", err);
      setError("Nije moguće dohvatiti zadnje Bitcoin blokove. Pokušajte ponovno kasnije.");
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  // Funkcija za dohvaćanje zadnjih transakcija
  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const transactions = await getLatestBitcoinTransactions(10);
      setBitcoinTransactions(transactions);
      console.log('Dohvaćene zadnje Bitcoin transakcije:', transactions);
    } catch (err) {
      console.error("Greška pri dohvaćanju zadnjih Bitcoin transakcija:", err);
      setError("Nije moguće dohvatiti zadnje Bitcoin transakcije. Pokušajte ponovno kasnije.");
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // Funkcija za dohvaćanje svih podataka odjednom
  const fetchAllData = useCallback(async () => {
    setError(null);
    
    try {
      await Promise.all([
        fetchPrice(),
        fetchStats(),
        fetchBlocks(),
        fetchTransactions()
      ]);
      
      setLastUpdated(formatTime());
    } catch (err) {
      console.error("Greška pri dohvaćanju podataka:", err);
      setError("Došlo je do greške pri dohvaćanju podataka. Pokušajte ponovno kasnije.");
    }
  }, [fetchPrice, fetchStats, fetchBlocks, fetchTransactions]);

  // Inicijalno dohvaćanje podataka
  useEffect(() => {
    fetchAllData();
    
    // Postavljamo intervale za osvježavanje podataka
    const priceInterval = setInterval(() => {
      fetchPrice().then(() => {
        // Dodajemo vizualni indikator osvježavanja
        const priceElement = document.getElementById('bitcoin-price-card');
        if (priceElement) {
          priceElement.classList.add('pulse-update');
          setTimeout(() => priceElement.classList.remove('pulse-update'), 1000);
        }
        setLastUpdated(formatTime());
      });
    }, 15000); // Svakih 15 sekundi
    
    const statsInterval = setInterval(() => {
      fetchStats().then(() => {
        // Dodajemo vizualni indikator osvježavanja
        const statsElements = document.querySelectorAll('.stats-card');
        statsElements.forEach(element => {
          element.classList.add('pulse-update');
          setTimeout(() => element.classList.remove('pulse-update'), 1000);
        });
      });
    }, 30000); // Svakih 30 sekundi
    
    const blocksInterval = setInterval(() => {
      fetchBlocks().then(() => {
        // Dodajemo vizualni indikator osvježavanja
        const blocksElement = document.getElementById('bitcoin-blocks-container');
        if (blocksElement) {
          blocksElement.classList.add('pulse-update');
          setTimeout(() => blocksElement.classList.remove('pulse-update'), 1000);
        }
      });
    }, 20000); // Svakih 20 sekundi
    
    const txInterval = setInterval(() => {
      fetchTransactions().then(() => {
        // Dodajemo vizualni indikator osvježavanja
        const txElement = document.getElementById('bitcoin-transactions-container');
        if (txElement) {
          txElement.classList.add('pulse-update');
          setTimeout(() => txElement.classList.remove('pulse-update'), 1000);
        }
      });
    }, 30000); // Svakih 30 sekundi
    
    return () => {
      clearInterval(priceInterval);
      clearInterval(statsInterval);
      clearInterval(blocksInterval);
      clearInterval(txInterval);
    };
  }, [fetchAllData, fetchPrice, fetchStats, fetchBlocks, fetchTransactions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bitcoin Explorer</h1>
      
      {/* Pretraživač */}
      <div className="mb-6">
        <BitcoinSearch />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchAllData} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Pokušaj ponovno
          </button>
        </div>
      )}
      
      <div className="mb-4 text-sm text-gray-600">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Zadnje osvježeno: {lastUpdated || "Učitavanje..."}
        </span>
      </div>
      
      <style jsx global>{`
        @keyframes pulseUpdate {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .pulse-update {
          animation: pulseUpdate 1s ease-out;
        }
      `}</style>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div id="bitcoin-price-card">
          <PodaciKartica 
            naslov="Cijena Bitcoina" 
            vrijednost={bitcoinPrice ? `$${bitcoinPrice.usd.toLocaleString('hr-HR')}` : "Učitavanje..."} 
            ikona={<FaBitcoin className="text-bitcoin" />} 
            loading={loadingPrice}
            promjena={bitcoinPrice?.usd_24h_change ? parseFloat(bitcoinPrice.usd_24h_change.toFixed(2)) : undefined}
          />
        </div>
        <div className="stats-card">
          <PodaciKartica 
            naslov="Zadnji blok" 
            vrijednost={bitcoinStats ? bitcoinStats.blocks_count : "Učitavanje..."} 
            ikona={<FaCubes className="text-bitcoin" />} 
            loading={loadingStats}
          />
        </div>
        <div className="stats-card">
          <PodaciKartica 
            naslov="Transakcije (24h)" 
            vrijednost={bitcoinStats ? bitcoinStats.transactions_24h.toLocaleString('hr-HR') : "Učitavanje..."} 
            ikona={<FaExchangeAlt className="text-bitcoin" />}
            loading={loadingStats}
          />
        </div>
        <div className="stats-card">
          <PodaciKartica 
            naslov="Prosječna naknada" 
            vrijednost={bitcoinStats ? `${bitcoinStats.average_fee} sat/vB` : "Učitavanje..."} 
            ikona={<FaNetworkWired className="text-bitcoin" />} 
            loading={loadingStats}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Zadnji blokovi */}
        <div id="bitcoin-blocks-container" className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCubes className="text-orange-500 mr-2" />
            Zadnji blokovi
          </h2>
          <BitcoinBlokoviTabela 
            blocks={bitcoinBlocks} 
            loading={loadingBlocks} 
            onBlockClick={(blockHash) => {
              console.log(`Kliknut blok: ${blockHash}`);
              setSelectedBlockHash(blockHash);
            }}
          />
        </div>
        {/* Zadnje transakcije */}
        <div id="bitcoin-transactions-container" className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaExchangeAlt className="text-orange-500 mr-2" />
            Zadnje transakcije
          </h2>
          <BitcoinTransakcijeTabela2 
            transactions={bitcoinTransactions} 
            loading={loadingTransactions} 
            onTransactionClick={(txHash) => {
              console.log(`Kliknuta transakcija: ${txHash}`);
              setSelectedTransactionHash(txHash);
            }}
          />
        </div>
      </div>
      
      {/* Elementi Hashrate, Težina, mempool transakcije i tržišna kapitalizacija su uklonjeni */}
      
      <div className="mb-8">
        <BitcoinCijenaGrafikon currentPrice={bitcoinPrice} />
      </div>
      
      {/* Pretraživač je premješten na vrh stranice */}
      
      {/* Modal za prikaz detalja transakcije */}
      {selectedTransactionHash && (
        <BitcoinTransakcijaDetalji 
          txHash={selectedTransactionHash} 
          onClose={() => setSelectedTransactionHash(null)} 
        />
      )}
      
      {/* Modal za prikaz detalja bloka */}
      {selectedBlockHash && (
        <BitcoinBlokDetalji 
          blockHash={selectedBlockHash} 
          onClose={() => setSelectedBlockHash(null)} 
        />
      )}
    </div>
  );
}
