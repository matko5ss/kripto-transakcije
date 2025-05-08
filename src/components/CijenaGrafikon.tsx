'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FaEthereum } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { dohvatiPovijestCijenaEthera, dohvatiStatickePodatke, isClient, dohvatiCijenuEthera, CijenaData } from '../services/dune';

// Registriramo potrebne komponente za Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface CijenaGrafikonProps {
  dani?: number;
}

export default function CijenaGrafikon({ dani = 7 }: CijenaGrafikonProps) {
  const [podaci, setPodaci] = useState<CijenaData[]>([]);
  const [trenutnaCijena, setTrenutnaCijena] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Funkcija za dohvaćanje trenutne cijene Ethereuma
  const fetchTrenutnaCijena = useCallback(async () => {
    try {
      const cijena = await dohvatiCijenuEthera();
      setTrenutnaCijena(cijena);
      
      // Postavljamo vrijeme zadnjeg osvježavanja
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
      
      return cijena;
    } catch (error) {
      console.error('Greška pri dohvaćanju trenutne cijene Ethereuma:', error);
      return 3200.50; // Fallback vrijednost
    }
  }, []);

  // Funkcija za dohvaćanje podataka o cijenama
  const fetchPodaci = useCallback(async () => {
    try {
      setLoading(true);
      
      // Za statički export koristimo preddefinirane podatke
      if (!isClient()) {
        const staticData = await dohvatiStatickePodatke();
        const mockPodaci = Array.from({ length: dani }, (_, i) => {
          const datum = new Date();
          datum.setDate(datum.getDate() - (dani - i - 1));
          return {
            datum: datum.toISOString().split('T')[0],
            cijena: staticData.cijenaEthera * (0.9 + Math.random() * 0.2)
          };
        });
        setPodaci(mockPodaci);
        setTrenutnaCijena(staticData.cijenaEthera);
        setLoading(false);
        return;
      }

      // Prvo dohvaćamo trenutnu cijenu
      const cijena = await fetchTrenutnaCijena();

      // Zatim dohvaćamo povijest cijena
      const povijestCijena = await dohvatiPovijestCijenaEthera(dani);
      
      if (povijestCijena && povijestCijena.length > 0) {
        // Dodajemo današnju cijenu u povijest
        const danas = new Date().toISOString().split('T')[0];
        
        // Filtriramo današnji datum ako već postoji
        const filtriranaPovijest = povijestCijena.filter(p => p.datum !== danas);
        
        // Dodajemo današnju cijenu
        const noviPodaci = [
          ...filtriranaPovijest,
          { datum: danas, cijena }
        ];
        
        // Sortiramo po datumu
        noviPodaci.sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
        
        setPodaci(noviPodaci);
      } else {
        console.log('Nema podataka o povijesti cijena, koristimo fallback');
        // Fallback podaci ako nema povijesti cijena
        const mockPodaci = Array.from({ length: dani }, (_, i) => {
          const datum = new Date();
          datum.setDate(datum.getDate() - (dani - i - 1));
          return {
            datum: datum.toISOString().split('T')[0],
            cijena: cijena * (0.9 + Math.random() * 0.2)
          };
        });
        
        // Dodajemo današnju cijenu
        mockPodaci.push({
          datum: new Date().toISOString().split('T')[0],
          cijena
        });
        
        setPodaci(mockPodaci);
      }
    } catch (error) {
      console.error('Greška pri dohvaćanju povijesti cijena:', error);
      // Fallback podaci u slučaju greške
      const fallbackCijena = 3200.50;
      setTrenutnaCijena(fallbackCijena);
      
      const mockPodaci = Array.from({ length: dani }, (_, i) => {
        const datum = new Date();
        datum.setDate(datum.getDate() - (dani - i - 1));
        return {
          datum: datum.toISOString().split('T')[0],
          cijena: fallbackCijena * (0.9 + Math.random() * 0.2)
        };
      });
      
      // Dodajemo današnju cijenu
      mockPodaci.push({
        datum: new Date().toISOString().split('T')[0],
        cijena: fallbackCijena
      });
      
      setPodaci(mockPodaci);
    } finally {
      setLoading(false);
    }
  }, [dani, fetchTrenutnaCijena]);

  // Funkcija za osvježavanje samo trenutne cijene (brže osvježavanje)
  const refreshTrenutnaCijena = useCallback(async () => {
    try {
      const cijena = await fetchTrenutnaCijena();
      
      // Ažuriramo današnju cijenu u podacima
      const danas = new Date().toISOString().split('T')[0];
      
      setPodaci(prev => {
        // Kopiramo prethodne podatke
        const noviPodaci = [...prev];
        
        // Pronalazimo indeks današnjeg datuma
        const danasIndex = noviPodaci.findIndex(p => p.datum === danas);
        
        // Ako postoji, ažuriramo cijenu
        if (danasIndex !== -1) {
          noviPodaci[danasIndex] = { ...noviPodaci[danasIndex], cijena };
        } else {
          // Ako ne postoji, dodajemo ga
          noviPodaci.push({ datum: danas, cijena });
          
          // Sortiramo po datumu
          noviPodaci.sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
        }
        
        return noviPodaci;
      });
    } catch (error) {
      console.error('Greška pri osvježavanju trenutne cijene:', error);
    }
  }, [fetchTrenutnaCijena]);

  useEffect(() => {
    // Inicijalno dohvaćanje svih podataka
    fetchPodaci();
    
    // Postavljamo interval za osvježavanje svih podataka svakih 30 sekundi
    const intervalPodaci = setInterval(() => {
      console.log("Osvježavanje povijesti cijena...");
      fetchPodaci();
    }, 30000); // 30 sekundi
    
    // Postavljamo interval za osvježavanje samo trenutne cijene svakih 5 sekundi
    const intervalTrenutnaCijena = setInterval(() => {
      console.log("Osvježavanje trenutne cijene...");
      refreshTrenutnaCijena();
    }, 5000); // 5 sekundi
    
    // Čistimo intervale kada se komponenta unmount-a
    return () => {
      clearInterval(intervalPodaci);
      clearInterval(intervalTrenutnaCijena);
    };
  }, [fetchPodaci, refreshTrenutnaCijena]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Cijena Ethereuma',
      },
    },
  };

  const data = {
    labels: podaci.map(p => p.datum),
    datasets: [
      {
        label: 'Cijena (USD)',
        data: podaci.map(p => p.cijena),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Cijena Ethereuma</h2>
        <div className="text-sm text-gray-500 flex items-center">
          <span className="mr-2">Osvježava se svakih 5s</span>
          {lastUpdated && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Zadnje osvježeno: {lastUpdated}
            </span>
          )}
        </div>
      </div>
      
      {trenutnaCijena && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaEthereum className="text-2xl text-blue-500 mr-2" />
              <span className="text-lg font-bold">Trenutna cijena:</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              ${trenutnaCijena.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}
      
      <div className="h-64">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
