"use client";

import { useState, useEffect } from "react";
import { FaBitcoin, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import { dohvatiBitcoinPovijestCijena } from "@/services/bitcoinDune";

interface BitcoinPovijestCijena {
  cijena: number;
  datum: string;
}

export default function BitcoinCijenaGrafikon() {
  const [povijestCijena, setPovijestCijena] = useState<BitcoinPovijestCijena[]>([]);
  const [razdoblje, setRazdoblje] = useState<7 | 14 | 30>(7);
  const [loading, setLoading] = useState<boolean>(true);

  // Funkcija za dohvaćanje podataka o povijesti cijena
  const dohvatiPovijestCijena = async () => {
    try {
      setLoading(true);
      const podaci = await dohvatiBitcoinPovijestCijena(razdoblje);
      if (podaci && podaci.length > 0) {
        // Sortiramo po datumu (uzlazno)
        const sortiranPodaci = [...podaci].sort((a, b) =>
          new Date(a.datum).getTime() - new Date(b.datum).getTime()
        );
        setPovijestCijena(sortiranPodaci);
      } else {
        console.error("Nema podataka o povijesti cijena");
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju povijesti cijena:", error);
      
      // Generirajmo neke testne podatke u slučaju greške
      const testniPodaci: BitcoinPovijestCijena[] = [];
      const trenutniDatum = new Date();
      const osnovnaCijena = 53748.92;
      
      for (let i = 0; i < razdoblje; i++) {
        const datum = new Date(trenutniDatum);
        datum.setDate(datum.getDate() - (razdoblje - i - 1));
        
        // Generiramo slučajnu cijenu +/- 10% od osnovne cijene
        const varijacija = (Math.random() * 20 - 10) / 100; // -10% do +10%
        const cijena = osnovnaCijena * (1 + varijacija);
        
        testniPodaci.push({
          cijena: parseFloat(cijena.toFixed(2)),
          datum: datum.toISOString()
        });
      }
      
      setPovijestCijena(testniPodaci);
    } finally {
      setLoading(false);
    }
  };

  // Dohvati podatke kada se komponenta učita i kada se promijeni razdoblje
  useEffect(() => {
    dohvatiPovijestCijena();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [razdoblje]);

  // Priprema podataka za grafikon
  const minCijena = povijestCijena.length > 0
    ? Math.min(...povijestCijena.map(p => p.cijena)) * 0.95 // 5% niže za bolji prikaz
    : 0;
  
  const maxCijena = povijestCijena.length > 0
    ? Math.max(...povijestCijena.map(p => p.cijena)) * 1.05 // 5% više za bolji prikaz
    : 100000;
  
  const rasponCijena = maxCijena - minCijena;

  // Funkcija za formatiranje datuma u lokalni format
  const formatirajDatum = (isoString: string) => {
    const datum = new Date(isoString);
    return `${datum.getDate().toString().padStart(2, '0')}.${(datum.getMonth() + 1).toString().padStart(2, '0')}.`;
  };

  // Računamo boju grafa ovisno o trendu (zelena ako raste, crvena ako pada)
  const bojaGrafa = povijestCijena.length >= 2 &&
    povijestCijena[povijestCijena.length - 1].cijena > povijestCijena[0].cijena
    ? "#10b981" // zelena
    : "#ef4444"; // crvena

  // Računamo promjenu cijene
  const promjena = povijestCijena.length >= 2
    ? ((povijestCijena[povijestCijena.length - 1].cijena - povijestCijena[0].cijena) / povijestCijena[0].cijena) * 100
    : 0;

  // Funkcija za generiranje path podataka za SVG
  const generirajGraphPath = () => {
    if (povijestCijena.length === 0) return "";
    
    const širina = 100; // Širina grafa u postotcima
    const visina = 100; // Visina grafa u postotcima
    
    // Računamo razmak između točaka
    const razmak = širina / (povijestCijena.length - 1);
    
    // Stvaramo path
    let path = `M0,${visina - ((povijestCijena[0].cijena - minCijena) / rasponCijena) * visina}`;
    
    povijestCijena.forEach((podatak, index) => {
      if (index === 0) return; // Preskačemo prvi podatak jer smo ga već dodali
      
      const x = index * razmak;
      const y = visina - ((podatak.cijena - minCijena) / rasponCijena) * visina;
      path += ` L${x},${y}`;
    });
    
    return path;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0 flex items-center">
          <FaBitcoin className="text-orange-500 mr-2" />
          Bitcoin - Kretanje cijene
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setRazdoblje(7)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              razdoblje === 7
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              <FaCalendarDay className="mr-1" />
              7 dana
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(14)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              razdoblje === 14
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              <FaCalendarWeek className="mr-1" />
              14 dana
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(30)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              razdoblje === 30
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              <FaCalendarAlt className="mr-1" />
              30 dana
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-lg">
          <div className="text-gray-400 dark:text-gray-500">Učitavanje grafikona...</div>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Početna cijena</p>
              <p className="font-semibold">
                ${povijestCijena.length > 0 ? povijestCijena[0].cijena.toLocaleString('hr-HR', { maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Trenutna cijena</p>
              <p className="font-semibold">
                ${povijestCijena.length > 0 ? povijestCijena[povijestCijena.length - 1].cijena.toLocaleString('hr-HR', { maximumFractionDigits: 2 }) : '0.00'}
              </p>
              <p className={`text-sm ${promjena >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {promjena >= 0 ? '▲' : '▼'} {Math.abs(promjena).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="relative h-60 mt-4">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Linija grafa */}
              <path
                d={generirajGraphPath()}
                stroke={bojaGrafa}
                strokeWidth="2"
                fill="none"
              />
              
              {/* Područje ispod linije */}
              <path
                d={`${generirajGraphPath()} L100,100 L0,100 Z`}
                fill={bojaGrafa}
                opacity="0.1"
              />
              
              {/* Točke za datume - na svakoj četvrtini grafa */}
              {povijestCijena.length > 0 && [0, 0.25, 0.5, 0.75, 1].map((postotak) => {
                const index = Math.min(Math.floor(postotak * (povijestCijena.length - 1)), povijestCijena.length - 1);
                const x = index / (povijestCijena.length - 1) * 100;
                const y = 100 - ((povijestCijena[index].cijena - minCijena) / rasponCijena) * 100;
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill={bojaGrafa}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            
            {/* X-os s datumima */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {povijestCijena.length > 0 && [0, 0.25, 0.5, 0.75, 1].map((postotak) => {
                const index = Math.min(Math.floor(postotak * (povijestCijena.length - 1)), povijestCijena.length - 1);
                return (
                  <div key={index}>
                    {formatirajDatum(povijestCijena[index].datum)}
                  </div>
                );
              })}
            </div>
            
            {/* Y-os s cijenama */}
            <div className="absolute top-0 right-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              {[0, 0.25, 0.5, 0.75, 1].map((postotak) => {
                const cijena = minCijena + (rasponCijena * (1 - postotak));
                return (
                  <div key={postotak}>
                    ${cijena.toLocaleString('hr-HR', { maximumFractionDigits: 0 })}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
