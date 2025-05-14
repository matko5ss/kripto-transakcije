"use client";

import { useEffect, useState, useCallback } from "react";
import { FaBitcoin, FaExchangeAlt, FaCubes, FaNetworkWired } from "react-icons/fa";
import axios from 'axios';
import PodaciKartica from "@/components/PodaciKartica";
import { 
  getBitcoinStatus,
  BitcoinTransaction,
  BitcoinBlock,
  BitcoinStatus
} from "@/services/pythonBitcoinService";
import { 
  dohvatiBitcoinCijenu, 
  BitcoinCijena, 
  dohvatiBitcoinZadnjiBlok,
  dohvatiBitcoinTransakcije24h
} from "@/services/bitcoinDune";

export default function BitcoinPage() {
  const [transakcije, setTransakcije] = useState<BitcoinTransaction[]>([]);
  const [blokovi, setBlokovi] = useState<BitcoinBlock[]>([]);
  const [status, setStatus] = useState<BitcoinStatus | null>(null);
  const [cijenaBitcoina, setCijenaBitcoina] = useState<BitcoinCijena | null>(null);
  const [zadnjiBlok, setZadnjiBlok] = useState<string>("");
  const [brojTransakcija24h, setBrojTransakcija24h] = useState<string>("");
  const [prosjecnaNaknada, setProsjecnaNaknada] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Funkcija za formatiranje vremena
  const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  // Funkcija za direktno dohvaćanje prosječne naknade s Dune API-ja koristeći query ID 5134500
  const fetchAvgFeeDirectly = async (): Promise<string> => {
    try {
      console.log('Počinjem dohvaćanje prosječne naknade s Dune API-ja (Query ID: 5134500)...');
      const duneApiKey = 'KbXKuJ2niPQF13TRf1e45ae4hshStmTy';
      const queryId = '5134500';
      
      // Pokrećemo upit
      console.log(`Pokrećem Dune upit ${queryId} za prosječnu naknadu...`);
      const executeResponse = await axios.post(
        `https://api.dune.com/api/v1/query/${queryId}/execute`,
        {},
        { headers: { 'x-dune-api-key': duneApiKey } }
      );
      
      console.log('Odgovor od Dune API-ja:', executeResponse.data);
      
      if (!executeResponse.data?.execution_id) {
        console.error('Nedostaje execution_id u odgovoru');
        return "20.50"; // Vraćamo fallback vrijednost ako ne možemo dobiti execution_id
      }
      
      const executionId = executeResponse.data.execution_id;
      console.log(`Dobiven execution_id: ${executionId}`);
      
      // Čekamo da se upit izvrši
      let attempts = 0;
      while (attempts < 15) { // Povećavamo broj pokušaja
        attempts++;
        console.log(`Pokušaj ${attempts}/15 provjere statusa upita...`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Dulje čekamo
        
        const statusResponse = await axios.get(
          `https://api.dune.com/api/v1/execution/${executionId}/status`,
          { headers: { 'x-dune-api-key': duneApiKey } }
        );
        
        console.log(`Status upita: ${statusResponse.data?.state}`);
        
        if (statusResponse.data?.state === 'QUERY_STATE_COMPLETED') {
          // Dohvaćamo rezultate
          console.log('Upit je završen, dohvaćam rezultate...');
          const resultsResponse = await axios.get(
            `https://api.dune.com/api/v1/execution/${executionId}/results`,
            { headers: { 'x-dune-api-key': duneApiKey } }
          );
          
          console.log('Rezultati upita:', JSON.stringify(resultsResponse.data, null, 2));
          
          if (resultsResponse.data?.result?.rows?.length > 0) {
            const row = resultsResponse.data.result.rows[0];
            console.log('Prvi red rezultata:', JSON.stringify(row, null, 2));
            
            // Prvo tražimo polje 'avg_fee' ili slično
            for (const key in row) {
              if (key.toLowerCase().includes('fee') || key.toLowerCase().includes('naknada')) {
                console.log(`Pronađeno polje s naknadom: ${key}: ${row[key]}`);
                if (row[key] !== null && row[key] !== undefined) {
                  return row[key].toString();
                }
              }
            }
            
            // Ako nismo našli specifično polje, vraćamo prvu numeričku vrijednost
            for (const key in row) {
              if (typeof row[key] === 'number') {
                console.log(`Pronađena numerička vrijednost u polju ${key}: ${row[key]}`);
                return row[key].toString();
              }
            }
            
            // Ako nema numeričkih vrijednosti, vraćamo prvi string koji se može pretvoriti u broj
            for (const key in row) {
              if (typeof row[key] === 'string' && !isNaN(parseFloat(row[key]))) {
                console.log(`Pronađen string koji se može pretvoriti u broj u polju ${key}: ${row[key]}`);
                return row[key];
              }
            }
            
            // Ako nismo našli ništa, vraćamo fallback vrijednost
            console.error('Nema numeričkih vrijednosti u rezultatu');
            return "20.50";
          } else {
            console.error('Nema redova u rezultatu');
            return "20.50";
          }
        } else if (statusResponse.data?.state === 'QUERY_STATE_FAILED') {
          console.error('Upit za prosječnu naknadu nije uspio');
          return "20.50";
        }
      }
      
      console.error('Isteklo vrijeme za dohvaćanje prosječne naknade');
      return "20.50";
    } catch (error) {
      console.error('Greška pri direktnom dohvaćanju prosječne naknade:', error);
      return "20.50";
    }
  };

  // Funkcija za dohvaćanje podataka
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dohvaćamo podatke paralelno za brže učitavanje - koristimo samo Dune API
      const [bitcoinPrice, latestBlock, transactions24h] = await Promise.all([
        dohvatiBitcoinCijenu(), // Dohvaćamo cijenu preko Dune API-ja
        dohvatiBitcoinZadnjiBlok(), // Dohvaćamo zadnji blok preko Dune API-ja
        dohvatiBitcoinTransakcije24h() // Dohvaćamo broj transakcija u zadnja 24h preko Dune API-ja
      ]);
      
      // Dohvaćamo prosječnu naknadu zasebno
      const avgFee = await fetchAvgFeeDirectly();
      
      // Postavljamo dummy podatke za Python API pozive koji ne rade
      const dummyStatus = {
        price: bitcoinPrice ? parseFloat(bitcoinPrice.usd.toString()) : 0,
        last_block: latestBlock ? parseInt(latestBlock) : 0,
        fee_rate: avgFee ? parseFloat(avgFee) : 0,
        transactions_count: transactions24h ? parseInt(transactions24h) : 0,
        difficulty: 0,
        hashrate: 0
      };
      
      const dummyTransakcije: BitcoinTransaction[] = [];
      const dummyBlokovi: BitcoinBlock[] = [];
      
      setStatus(dummyStatus);
      setTransakcije(dummyTransakcije);
      setBlokovi(dummyBlokovi);
      setCijenaBitcoina(bitcoinPrice); // Postavljamo cijenu Bitcoina
      setZadnjiBlok(latestBlock); // Postavljamo zadnji blok
      setBrojTransakcija24h(transactions24h); // Postavljamo broj transakcija u zadnja 24h
      
      if (avgFee) {
        console.log('Uspješno dohvaćena prosječna naknada u fetchData:', avgFee);
        setProsjecnaNaknada(avgFee); // Postavljamo prosječnu naknadu samo ako je uspješno dohvaćena
      }
      
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
    // Odmah dohvaćamo prosječnu naknadu direktno s Dune API-ja
    const fetchInitialAvgFee = async () => {
      try {
        const avgFee = await fetchAvgFeeDirectly();
        if (avgFee) {
          console.log('Uspješno dohvaćena inicijalna prosječna naknada:', avgFee);
          setProsjecnaNaknada(avgFee);
        } else {
          console.error('Nije moguće dohvatiti inicijalnu prosječnu naknadu');
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju inicijalne prosječne naknade:', error);
      }
    };
    
    fetchInitialAvgFee();
    fetchData();
    
    // Postavljamo intervale za automatsko osvježavanje podataka
    const priceInterval = setInterval(async () => {
      try {
        // Dohvaćamo cijenu Bitcoina preko Dune API-ja
        const bitcoinPrice = await dohvatiBitcoinCijenu();
        setCijenaBitcoina(bitcoinPrice);
        
        // Dohvaćamo zadnji blok preko Dune API-ja
        const latestBlock = await dohvatiBitcoinZadnjiBlok();
        setZadnjiBlok(latestBlock);
        
        // Dohvaćamo broj transakcija u zadnja 24h preko Dune API-ja
        const transactions24h = await dohvatiBitcoinTransakcije24h();
        setBrojTransakcija24h(transactions24h);
        
        // Direktno dohvaćamo prosječnu naknadu s Dune API-ja
        const avgFee = await fetchAvgFeeDirectly();
        if (avgFee) {
          console.log('Uspješno dohvaćena prosječna naknada pri osvježavanju:', avgFee);
          setProsjecnaNaknada(avgFee);
        }
        
        // Dohvaćamo ostale podatke o statusu
        const statusData = await getBitcoinStatus();
        setStatus(statusData);
        
        setLastUpdated(formatTime());
      } catch (err) {
        console.error("Greška pri osvježavanju podataka:", err);
      }
    }, 30000); // Svakih 30 sekundi osvježavamo podatke za ažurne informacije
    
    const dataInterval = setInterval(() => {
      fetchData();
    }, 60000); // Svakih 60 sekundi osvježavamo sve podatke
    
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
            naslov="Zadnji blok (Dune API)"
            vrijednost={zadnjiBlok ? zadnjiBlok.toString() : "Učitavanje..."}
            ikona={<FaCubes className="text-bitcoin" />}
            loading={false}
          />
          <PodaciKartica
            naslov="Broj transakcija (zadnja 24h)"
            vrijednost={brojTransakcija24h ? parseInt(brojTransakcija24h).toLocaleString() : "Učitavanje..."}
            ikona={<FaExchangeAlt className="text-bitcoin" />}
            loading={false}
          />
          <PodaciKartica
            naslov="Prosječna naknada (sat/vB)"
            vrijednost={prosjecnaNaknada && !isNaN(parseFloat(prosjecnaNaknada)) ? 
              parseFloat(prosjecnaNaknada).toExponential(2) : "Učitavanje..."}
            ikona={<FaNetworkWired className="text-bitcoin" />}
            loading={false}
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
                blokovi.length > 0 ? (
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
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Nema dostupnih podataka o blokovima
                    </td>
                  </tr>
                )
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
                transakcije.length > 0 ? (
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
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      Nema dostupnih podataka o transakcijama
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
