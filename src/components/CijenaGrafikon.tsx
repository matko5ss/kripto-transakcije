'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { dohvatiPovijestCijenaEthera } from '../services/moralis';

// Registriramo potrebne komponente za Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CijenaGrafikonProps {
  dani?: number;
}

export default function CijenaGrafikon({ dani = 7 }: CijenaGrafikonProps) {
  const [podaci, setPodaci] = useState<{cijene: number[], datumi: string[]}>({
    cijene: [],
    datumi: []
  });
  const [ucitavanje, setUcitavanje] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);

  useEffect(() => {
    const dohvatiPodatke = async () => {
      try {
        setUcitavanje(true);
        const povijestCijena = await dohvatiPovijestCijenaEthera(dani);
        setPodaci(povijestCijena);
        setGreska(null);
      } catch (error) {
        console.error('Greška pri dohvaćanju povijesti cijena:', error);
        setGreska('Nije moguće dohvatiti podatke o cijenama');
      } finally {
        setUcitavanje(false);
      }
    };

    dohvatiPodatke();
  }, [dani]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Kretanje cijene Ethereuma',
      },
    },
  };

  const data = {
    labels: podaci.datumi,
    datasets: [
      {
        label: 'Cijena (USD)',
        data: podaci.cijene,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  if (ucitavanje) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <div className="text-gray-500">Učitavanje podataka...</div>
      </div>
    );
  }

  if (greska) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <div className="text-red-500">{greska}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Line options={options} data={data} />
      
      <div className="mt-4 flex justify-center space-x-2">
        <button 
          onClick={() => dohvatiPovijestCijenaEthera(1)}
          className={`px-3 py-1 rounded ${dani === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          1D
        </button>
        <button 
          onClick={() => dohvatiPovijestCijenaEthera(7)}
          className={`px-3 py-1 rounded ${dani === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          7D
        </button>
        <button 
          onClick={() => dohvatiPovijestCijenaEthera(30)}
          className={`px-3 py-1 rounded ${dani === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          30D
        </button>
        <button 
          onClick={() => dohvatiPovijestCijenaEthera(90)}
          className={`px-3 py-1 rounded ${dani === 90 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          90D
        </button>
      </div>
    </div>
  );
}
