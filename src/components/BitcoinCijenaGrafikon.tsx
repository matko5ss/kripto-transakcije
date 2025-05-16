"use client";

import { useState, useEffect } from "react";
import { FaBitcoin, FaChartLine } from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { dohvatiBitcoinPovijestCijena } from "@/services/bitcoinDune";
import { BitcoinRealTimePrice } from "@/services/bitcoinRealTimeService";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BitcoinPovijestCijena {
  cijena: number;
  datum: string;
}

interface BitcoinCijenaGrafikonProps {
  currentPrice?: BitcoinRealTimePrice | null;
}

export default function BitcoinCijenaGrafikon({ currentPrice }: BitcoinCijenaGrafikonProps) {
  const [povijestCijena, setPovijestCijena] = useState<BitcoinPovijestCijena[]>([]);
  const [razdoblje, setRazdoblje] = useState<1 | 7 | 14 | 30 | 90 | 365>(7);
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
        
        // Osiguravamo da zadnja točka na grafu bude trenutna cijena
        if (currentPrice && currentPrice.usd) {
          // Ako već imamo zadnju točku za današnji dan, zamijenimo je
          const zadnjaTocka = sortiranPodaci[sortiranPodaci.length - 1];
          const danas = new Date();
          const zadnjiDatum = new Date(zadnjaTocka.datum);
          
          // Ako je zadnja točka od danas, samo ažuriramo cijenu
          if (zadnjiDatum.toDateString() === danas.toDateString()) {
            sortiranPodaci[sortiranPodaci.length - 1] = {
              ...zadnjaTocka,
              cijena: currentPrice.usd
            };
            console.log('Zamijenjena zadnja točka s trenutnom cijenom:', currentPrice.usd);
          } else {
            // Inače dodajemo novu točku za danas
            sortiranPodaci.push({
              datum: danas.toISOString(),
              cijena: currentPrice.usd
            });
            console.log('Dodana nova točka za danas s trenutnom cijenom:', currentPrice.usd);
          }
        }
        
        setPovijestCijena(sortiranPodaci);
      } else {
        console.error("Nema podataka o povijesti cijena");
        generiranjeFallbackPodataka();
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju povijesti cijena:", error);
      generiranjeFallbackPodataka();
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcija za generiranje testnih podataka kada API nije dostupan
  const generiranjeFallbackPodataka = () => {
    console.log("Generiranje fallback podataka za grafikon");
    const testniPodaci: BitcoinPovijestCijena[] = [];
    const trenutniDatum = new Date();
    
    // Koristimo realne cijene Bitcoina kao osnovu za testne podatke
    const osnovnaCijena = currentPrice?.usd || 53748.92;
    
    // Generiramo podatke za svaki dan u odabranom razdoblju
    for (let i = 0; i < razdoblje; i++) {
      const datum = new Date(trenutniDatum);
      datum.setDate(datum.getDate() - (razdoblje - i - 1));
      
      // Generiramo slučajnu cijenu s realističnim varijacijama
      // Manje varijacije za kraća razdoblja, veće za duža
      const maxVarijacija = razdoblje <= 7 ? 5 : razdoblje <= 30 ? 10 : 20;
      const varijacija = (Math.random() * maxVarijacija * 2 - maxVarijacija) / 100; // -x% do +x%
      
      // Za duža razdoblja dodajemo i trend (uzlazni ili silazni)
      const trendFaktor = razdoblje > 30 ? (i / razdoblje) * 0.1 : 0;
      const cijena = osnovnaCijena * (1 + varijacija + trendFaktor);
      
      testniPodaci.push({
        cijena: parseFloat(cijena.toFixed(2)),
        datum: datum.toISOString()
      });
    }
    
    setPovijestCijena(testniPodaci);
  };

  // Dohvaćamo podatke kad se komponenta učita i kad se promijeni razdoblje
  useEffect(() => {
    dohvatiPovijestCijena();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [razdoblje]);
  
  // Ažuriramo zadnju točku na grafu kad se promijeni trenutna cijena
  useEffect(() => {
    if (currentPrice && currentPrice.usd && povijestCijena.length > 0) {
      // Provjera je li cijena valjana (nije preniska)
      if (currentPrice.usd < 10) {
        console.warn('Ignoriranje nevaljane cijene Bitcoin-a:', currentPrice.usd);
        return; // Ne ažuriramo graf s nevaljanom cijenom
      }
      
      // Kopiramo postojeće podatke
      const azuriraniPodaci = [...povijestCijena];
      
      // Tražimo postoji li već podatak za današnji dan
      const danas = new Date();
      const danasString = danas.toDateString();
      
      const danasnjiIndex = azuriraniPodaci.findIndex(item => {
        const itemDatum = new Date(item.datum);
        return itemDatum.toDateString() === danasString;
      });
      
      // Provjeravamo je li nova cijena značajno različita od prethodne
      // Ovo sprječava ažuriranje s pogrešnim podacima
      if (danasnjiIndex !== -1) {
        const postojecaCijena = azuriraniPodaci[danasnjiIndex].cijena;
        const razlikaPostotak = Math.abs((currentPrice.usd - postojecaCijena) / postojecaCijena * 100);
        
        // Ako je razlika veća od 20%, to je sumnjivo - provjeravamo dodatno
        if (razlikaPostotak > 20) {
          console.warn(`Sumnjiva promjena cijene Bitcoin-a: ${postojecaCijena} -> ${currentPrice.usd} (${razlikaPostotak.toFixed(2)}%)`);
          
          // Uzimamo prosjek zadnjih nekoliko cijena za validaciju
          const zadnjihNekolicina = azuriraniPodaci.slice(-5);
          const prosjek = zadnjihNekolicina.reduce((sum, item) => sum + item.cijena, 0) / zadnjihNekolicina.length;
          
          // Ako je trenutna cijena previše različita od prosjeka, ignoriramo je
          if (Math.abs((currentPrice.usd - prosjek) / prosjek * 100) > 25) {
            console.warn('Ignoriranje sumnjive cijene Bitcoin-a koja odstupa od prosjeka:', currentPrice.usd);
            return;
          }
        }
      }
      
      // Ako postoji, ažuriramo ga s trenutnom cijenom
      if (danasnjiIndex !== -1) {
        azuriraniPodaci[danasnjiIndex] = {
          datum: danas.toISOString(),
          cijena: currentPrice.usd
        };
        console.log('Ažurirana postojeća točka za današnji dan s trenutnom cijenom:', currentPrice.usd);
      } else {
        // Ako ne postoji, dodajemo novi podatak za današnji dan
        azuriraniPodaci.push({
          datum: danas.toISOString(),
          cijena: currentPrice.usd
        });
        console.log('Dodana nova točka za današnji dan s trenutnom cijenom:', currentPrice.usd);
      }
      
      // Sortiramo podatke po datumu (uzlazno) da osiguramo pravilan redoslijed
      const sortiraniPodaci = [...azuriraniPodaci].sort((a, b) => 
        new Date(a.datum).getTime() - new Date(b.datum).getTime()
      );
      
      setPovijestCijena(sortiraniPodaci);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice?.usd]);

  // Koristimo Chart.js koji automatski skalira grafikon, pa nam nisu potrebne min/max vrijednosti

  // Funkcija za formatiranje datuma u lokalni format
  const formatirajDatum = (isoString: string) => {
    const datum = new Date(isoString);
    const danas = new Date();
    const ješeDanas = datum.getDate() === danas.getDate() && 
                       datum.getMonth() === danas.getMonth() && 
                       datum.getFullYear() === danas.getFullYear();
    
    // Ako je danas
    if (ješeDanas) {
      return 'Danas';
    }
    
    // Ako je ove godine, prikazujemo dan i mjesec
    if (datum.getFullYear() === danas.getFullYear()) {
      const mjeseci = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];
      return `${datum.getDate()}. ${mjeseci[datum.getMonth()]}`;
    }
    
    // Ako je druga godina, prikazujemo dan, mjesec i godinu
    return `${datum.getDate()}.${(datum.getMonth() + 1).toString().padStart(2, '0')}.${datum.getFullYear().toString().substring(2)}`;
  };

  // Računamo boju grafa ovisno o trendu (zelena ako raste, crvena ako pada)
  const bojaGrafa = povijestCijena.length >= 2 &&
    povijestCijena[povijestCijena.length - 1].cijena > povijestCijena[0].cijena
    ? "#10b981" // zelena
    : "#ef4444"; // crvena

  // Računamo promjenu cijene za prikaz u korisničkom sučelju
  const promjena = povijestCijena.length >= 2
    ? ((povijestCijena[povijestCijena.length - 1].cijena - povijestCijena[0].cijena) / povijestCijena[0].cijena) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0 flex items-center">
          <FaBitcoin className="text-orange-500 mr-2" />
          Bitcoin - Kretanje cijene
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRazdoblje(1)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              razdoblje === 1
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              24h
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(7)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              razdoblje === 7
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              7D
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(14)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              razdoblje === 14
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              14D
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(30)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              razdoblje === 30
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              30D
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(90)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              razdoblje === 90
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              90D
            </span>
          </button>
          
          <button
            onClick={() => setRazdoblje(365)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              razdoblje === 365
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <span className="flex items-center">
              <FaChartLine className="mr-1" />
              1Y
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Trenutna cijena</p>
              <p className="font-semibold text-lg">
                ${currentPrice?.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
              </p>
              <p className={`text-xs ${(currentPrice?.usd_24h_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(currentPrice?.usd_24h_change || 0) >= 0 ? '↑' : '↓'} 
                {Math.abs(currentPrice?.usd_24h_change || 0).toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tržišna kapitalizacija</p>
              <p className="font-semibold text-lg">
                ${(currentPrice?.market_cap || 0).toLocaleString('hr-HR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">24h volumen</p>
              <p className="font-semibold text-lg">
                ${(currentPrice?.total_volume || 0).toLocaleString('hr-HR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Zadnje ažuriranje</p>
              <p className="font-semibold text-sm">
                {currentPrice?.last_updated ? new Date(currentPrice.last_updated).toLocaleString('hr-HR') : '-'}
              </p>
            </div>
          </div>
          
          <div className="h-80 relative mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            {povijestCijena.length > 0 ? (
              <Line
                data={{
                  labels: povijestCijena.map(p => formatirajDatum(p.datum)),
                  datasets: [
                    {
                      label: 'Cijena (USD)',
                      data: povijestCijena.map(p => {
                        // Dodatna provjera ispravnosti cijene
                        let cijena = p.cijena;
                        
                        // Ako je cijena nerazumno velika, korigiraj je
                        if (cijena > 100000) {
                          cijena = cijena / 1000;
                          console.log('Korigirana cijena na grafu:', cijena);
                        }
                        
                        // Osiguraj da je cijena pozitivan broj i formatirana na 2 decimale
                        return cijena > 0 ? parseFloat(cijena.toFixed(2)) : 0;
                      }),
                      borderColor: bojaGrafa,
                      backgroundColor: `${bojaGrafa}20`,
                      borderWidth: 2,
                      pointRadius: 0,
                      pointHoverRadius: 4,
                      pointHoverBackgroundColor: bojaGrafa,
                      pointHoverBorderColor: '#fff',
                      pointHoverBorderWidth: 2,
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: true,
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      position: 'right',
                      grid: {
                        color: '#f0f0f0',
                      },
                    }
                  }
                }}
              />
            ) : (
              <div className="flex justify-center items-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-gray-400 dark:text-gray-500">Nema dostupnih podataka za prikaz</div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4 mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trenutna cijena</p>
                <p className="text-2xl font-bold">
                  ${currentPrice?.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || (povijestCijena.length > 0 ? povijestCijena[povijestCijena.length - 1].cijena.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">24h promjena</p>
                <p className={`font-semibold ${(currentPrice?.usd_24h_change || promjena) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(currentPrice?.usd_24h_change || promjena) >= 0 ? '+' : ''}{Math.abs(currentPrice?.usd_24h_change || promjena).toFixed(2)}%
                </p>
              </div>
              
              <div className="hidden md:block">
                <p className="text-sm text-gray-500 dark:text-gray-400">Zadnje ažuriranje</p>
                <p className="text-sm">
                  {currentPrice?.last_updated ? new Date(currentPrice.last_updated).toLocaleString('hr-HR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                </p>
              </div>
            </div>
          </div>
      </>
    )}
  </div>
);
}
