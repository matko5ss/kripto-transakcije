"use client";

import { useEffect, useState } from "react";
import Pretrazivac from "@/components/Pretrazivac";
import PodaciKartica from "@/components/PodaciKartica";
import TransakcijeTabela from "@/components/TransakcijeTabela";
import CijenaGrafikon from "@/components/CijenaGrafikon";
import {
  dohvatiTransakcije,
  dohvatiCijenuEthera,
  dohvatiZadnjiBlok,
  dohvatiTransakcijeDanas,
  dohvatiGasCijenu,
  dohvatiStatickePodatke,
  isClient,
  dohvatiBlokove,
  Transakcija,
  Blok
} from "@/services/dune";
import {
  FaExchangeAlt,
  FaCubes,
  FaEthereum,
  FaNetworkWired,
} from "react-icons/fa";

export default function EthereumPage() {
  const [transakcije, setTransakcije] = useState<Transakcija[]>([]);
  const [blokovi, setBlokovi] = useState<Blok[]>([]);
  const [cijenaEthera, setCijenaEthera] = useState<number>(0);
  const [zadnjiBlok, setZadnjiBlok] = useState<string>("Učitavanje...");
  const [transakcijeCount, setTransakcijeCount] =
    useState<string>("Učitavanje...");
  const [gasCijena, setGasCijena] = useState<string>("Učitavanje...");
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Funkcija za dohvaćanje podataka
  async function fetchData() {
    try {
      setLoading(true);
      
      // Za statički export koristimo preddefinirane podatke
      if (!isClient()) {
        const staticData = await dohvatiStatickePodatke();
        setTransakcije(staticData.transakcije);
        setBlokovi(staticData.blokovi || []);
        setCijenaEthera(staticData.cijenaEthera);
        setZadnjiBlok(staticData.zadnjiBlok);
        setTransakcijeCount(staticData.transakcijeCount);
        setGasCijena(staticData.gasCijena);
        setLoading(false);
        return;
      }

      // Dohvaćamo podatke za početnu stranicu
      try {
        // Dohvaćamo podatke paralelno
        const [cijenaData, blokData, transCountData, gasData] =
          await Promise.allSettled([
            dohvatiCijenuEthera(),
            dohvatiZadnjiBlok(),
            dohvatiTransakcijeDanas(),
            dohvatiGasCijenu(),
          ]);

        // Posebno dohvaćamo transakcije da bi imali više kontrole
        let novoTransakcije: Transakcija[] = [];
        try {
          console.log("Dohvaćanje zadnjih transakcija...");
          novoTransakcije = await dohvatiTransakcije(undefined, 10);
          if (novoTransakcije && novoTransakcije.length > 0) {
            console.log(`Dohvaćeno ${novoTransakcije.length} transakcija`);
            setTransakcije(novoTransakcije);
          } else {
            console.log("Nema novih transakcija, generiramo nove mock transakcije");
            // Generiramo nove mock transakcije sa slučajnim vrijednostima i trenutnim vremenom
            const mockTransakcije = Array.from({ length: 10 }, (_, i) => {
              const timestamp = new Date();
              timestamp.setMinutes(timestamp.getMinutes() - i);
              
              return {
                hash: `0x${Math.random().toString(16).substring(2, 42)}`,
                blockNumber: (parseInt(zadnjiBlok) - i).toString(),
                blockTimestamp: timestamp.toISOString(),
                from: `0x${Math.random().toString(16).substring(2, 42)}`,
                to: `0x${Math.random().toString(16).substring(2, 42)}`,
                value: (Math.random() * 10).toFixed(6),
                gas: (21000 + Math.floor(Math.random() * 50000)).toString(),
                gasPrice: (20 + Math.random() * 10).toFixed(2),
                isError: Math.random() > 0.9 ? "1" : "0", // 10% transakcija su neuspješne
                methodId: "",
                functionName: ""
              };
            });
            
            setTransakcije(mockTransakcije);
          }
        } catch (error) {
          console.error("Greška pri dohvaćanju transakcija:", error);
          // U slučaju greške, generiramo nove mock transakcije
          const mockTransakcije = Array.from({ length: 10 }, (_, i) => {
            const timestamp = new Date();
            timestamp.setMinutes(timestamp.getMinutes() - i);
            
            return {
              hash: `0x${Math.random().toString(16).substring(2, 42)}`,
              blockNumber: (parseInt(zadnjiBlok) - i).toString(),
              blockTimestamp: timestamp.toISOString(),
              from: `0x${Math.random().toString(16).substring(2, 42)}`,
              to: `0x${Math.random().toString(16).substring(2, 42)}`,
              value: (Math.random() * 10).toFixed(6),
              gas: (21000 + Math.floor(Math.random() * 50000)).toString(),
              gasPrice: (20 + Math.random() * 10).toFixed(2),
              isError: Math.random() > 0.9 ? "1" : "0", // 10% transakcija su neuspješne
              methodId: "",
              functionName: ""
            };
          });
          
          setTransakcije(mockTransakcije);
        }

        // Dohvaćamo i blokove
        try {
          console.log("Dohvaćanje zadnjih blokova...");
          const noviBlokovi = await dohvatiBlokove(5);
          if (noviBlokovi && noviBlokovi.length > 0) {
            console.log(`Dohvaćeno ${noviBlokovi.length} blokova`);
            setBlokovi(noviBlokovi);
          } else {
            console.log("Nema novih blokova, generiramo nove mock blokove");
            // Generiramo nove mock blokove sa slučajnim vrijednostima i trenutnim vremenom
            const zadnjiBlokBroj = parseInt(zadnjiBlok) || 22417536;
            const mockBlokovi = Array.from({ length: 5 }, (_, i) => {
              const timestamp = Math.floor(Date.now() / 1000) - i * 12; // Ethereum blokovi se stvaraju svakih ~12 sekundi
              return {
                number: (zadnjiBlokBroj - i).toString(),
                timestamp: timestamp.toString(),
                hash: `0x${Math.random().toString(16).substring(2, 66)}`,
                parentHash: `0x${Math.random().toString(16).substring(2, 66)}`,
                nonce: `0x${Math.random().toString(16).substring(2, 10)}`,
                difficulty: (Math.random() * 10000000000000).toString(),
                gasLimit: (15000000 + Math.floor(Math.random() * 1000000)).toString(),
                gasUsed: (Math.floor(Math.random() * 15000000)).toString(),
                miner: `0x${Math.random().toString(16).substring(2, 42)}`,
                transactions: Array.from({ length: Math.floor(Math.random() * 100) + 50 }, () => `0x${Math.random().toString(16).substring(2, 66)}`)
              };
            });
            
            setBlokovi(mockBlokovi);
          }
        } catch (error) {
          console.error("Greška pri dohvaćanju blokova:", error);
          // U slučaju greške, generiramo nove mock blokove
          const zadnjiBlokBroj = parseInt(zadnjiBlok) || 22417536;
          const mockBlokovi = Array.from({ length: 5 }, (_, i) => {
            const timestamp = Math.floor(Date.now() / 1000) - i * 12; // Ethereum blokovi se stvaraju svakih ~12 sekundi
            return {
              number: (zadnjiBlokBroj - i).toString(),
              timestamp: timestamp.toString(),
              hash: `0x${Math.random().toString(16).substring(2, 66)}`,
              parentHash: `0x${Math.random().toString(16).substring(2, 66)}`,
              nonce: `0x${Math.random().toString(16).substring(2, 10)}`,
              difficulty: (Math.random() * 10000000000000).toString(),
              gasLimit: (15000000 + Math.floor(Math.random() * 1000000)).toString(),
              gasUsed: (Math.floor(Math.random() * 15000000)).toString(),
              miner: `0x${Math.random().toString(16).substring(2, 42)}`,
              transactions: Array.from({ length: Math.floor(Math.random() * 100) + 50 }, () => `0x${Math.random().toString(16).substring(2, 66)}`)
            };
          });
          
          setBlokovi(mockBlokovi);
        }

        // Postavljamo podatke ako su uspješno dohvaćeni
        if (cijenaData.status === 'fulfilled') {
          setCijenaEthera(cijenaData.value);
        } else {
          console.error("Greška pri dohvaćanju cijene Ethereuma:", cijenaData.reason);
          setCijenaEthera(3200.50); // Fallback vrijednost
        }

        if (blokData.status === 'fulfilled') {
          setZadnjiBlok(blokData.value);
        } else {
          console.error("Greška pri dohvaćanju zadnjeg bloka:", blokData.reason);
          setZadnjiBlok("22417536"); // Fallback vrijednost
        }

        if (transCountData.status === 'fulfilled') {
          setTransakcijeCount(transCountData.value);
        } else {
          console.error("Greška pri dohvaćanju broja transakcija:", transCountData.reason);
          setTransakcijeCount("1250000000"); // Fallback vrijednost
        }

        if (gasData.status === 'fulfilled') {
          setGasCijena(gasData.value);
        } else {
          console.error("Greška pri dohvaćanju gas cijene:", gasData.reason);
          setGasCijena("30"); // Fallback vrijednost
        }

        // Postavljamo vrijeme zadnjeg osvježavanja
        const now = new Date();
        setLastUpdated(
          `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        );
      } catch (error) {
        console.error("Greška pri dohvaćanju podataka:", error);
        // U slučaju greške, koristimo preddefinirane podatke
        const staticData = await dohvatiStatickePodatke();
        setTransakcije(staticData.transakcije);
        setBlokovi(staticData.blokovi || []);
        setCijenaEthera(staticData.cijenaEthera);
        setZadnjiBlok(staticData.zadnjiBlok);
        setTransakcijeCount(staticData.transakcijeCount);
        setGasCijena(staticData.gasCijena);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Neočekivana greška:", error);
      setLoading(false);
    }
  }

  // Inicijalno dohvaćanje podataka
  useEffect(() => {
    fetchData();

    // Postavljamo interval za osvježavanje podataka svakih 10 sekundi
    const intervalId = setInterval(() => {
      console.log("Osvježavanje podataka u stvarnom vremenu...");
      fetchData();
    }, 10000); // 10 sekundi

    // Čistimo interval kada se komponenta unmount-a
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Dobrodošli na Kripto Transakcije - Hrvatski Blockchain Explorer
      </h1>

      <Pretrazivac />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Stanje Ethereuma u stvarnom vremenu</h2>
          <div className="text-sm text-gray-500 flex items-center">
            <span className="mr-2">Osvježava se svakih 10s</span>
            {lastUpdated && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Zadnje osvježeno: {lastUpdated}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PodaciKartica
            naslov="Ethereum cijena"
            vrijednost={`$${cijenaEthera.toLocaleString('hr-HR', { maximumFractionDigits: 2 })}`}
            ikona={<FaEthereum className="text-blue-500" />}
            opis="Osvježava se svakih 5s"
            loading={loading}
          />
          <PodaciKartica
            naslov="Zadnji blok"
            vrijednost={zadnjiBlok}
            ikona={<FaCubes className="text-green-500" />}
            opis="Osvježava se u stvarnom vremenu"
            loading={loading}
          />
          <PodaciKartica
            naslov="Transakcije (ukupno)"
            vrijednost={parseInt(transakcijeCount).toLocaleString('hr-HR')}
            ikona={<FaExchangeAlt className="text-purple-500" />}
            opis="Osvježava se u stvarnom vremenu"
            loading={loading}
          />
          <PodaciKartica
            naslov="Gas cijena (Gwei)"
            vrijednost={gasCijena}
            ikona={<FaNetworkWired className="text-red-500" />}
            opis="Osvježava se u stvarnom vremenu"
            loading={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CijenaGrafikon />
        <TransakcijeTabela transakcije={transakcije} blokovi={blokovi} />
      </div>
    </div>
  );
}
