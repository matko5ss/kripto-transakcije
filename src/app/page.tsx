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
} from "@/services/moralis";
import {
  FaExchangeAlt,
  FaCubes,
  FaEthereum,
  FaNetworkWired,
} from "react-icons/fa";
import { Transakcija } from "@/services/moralis";

export default function Home() {
  const [transakcije, setTransakcije] = useState<Transakcija[]>([]);
  const [cijenaEthera, setCijenaEthera] = useState<number>(0);
  const [zadnjiBlok, setZadnjiBlok] = useState<string>("Učitavanje...");
  const [transakcijeCount, setTransakcijeCount] =
    useState<string>("Učitavanje...");
  const [gasCijena, setGasCijena] = useState<string>("Učitavanje...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Za statički export koristimo preddefinirane podatke
        if (!isClient()) {
          const staticData = await dohvatiStatickePodatke();
          setTransakcije(staticData.transakcije);
          setCijenaEthera(staticData.cijenaEthera);
          setZadnjiBlok(staticData.zadnjiBlok);
          setTransakcijeCount(staticData.transakcijeCount);
          setGasCijena(staticData.gasCijena);
          setLoading(false);
          return;
        }

        // Dohvaćamo podatke za početnu stranicu
        const [transData, cijenaData, blokData, transCountData, gasData] =
          await Promise.all([
            dohvatiTransakcije(undefined, 10),
            dohvatiCijenuEthera(),
            dohvatiZadnjiBlok(),
            dohvatiTransakcijeDanas(),
            dohvatiGasCijenu(),
          ]);

        setTransakcije(transData);
        setCijenaEthera(cijenaData);
        setZadnjiBlok(blokData);
        setTransakcijeCount(transCountData);
        setGasCijena(gasData);
        setLoading(false);
      } catch (error) {
        console.error("Greška pri dohvaćanju podataka:", error);
        // U slučaju greške, koristimo preddefinirane podatke
        const staticData = await dohvatiStatickePodatke();
        setTransakcije(staticData.transakcije);
        setCijenaEthera(staticData.cijenaEthera);
        setZadnjiBlok(staticData.zadnjiBlok);
        setTransakcijeCount(staticData.transakcijeCount);
        setGasCijena(staticData.gasCijena);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Doobrodošli na Kripto Transakcije - Hrvatski Blockchain Explorer
      </h1>

      <Pretrazivac />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PodaciKartica
          naslov="Cijena Ethereuma"
          vrijednost={
            loading
              ? "Učitavanje..."
              : `$${cijenaEthera.toLocaleString("hr-HR")}`
          }
          ikona={<FaEthereum />}
          boja="blue"
        />
        <PodaciKartica
          naslov="Zadnji blok"
          vrijednost={zadnjiBlok}
          ikona={<FaCubes />}
          boja="green"
        />
        <PodaciKartica
          naslov="Transakcije danas"
          vrijednost={transakcijeCount}
          ikona={<FaExchangeAlt />}
          boja="purple"
        />
        <PodaciKartica
          naslov="Gas cijena"
          vrijednost={gasCijena}
          ikona={<FaNetworkWired />}
          boja="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TransakcijeTabela transakcije={transakcije} />
        </div>
        <div>
          <CijenaGrafikon dani={7} />
        </div>
      </div>
    </div>
  );
}
