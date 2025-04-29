import Pretrazivac from '@/components/Pretrazivac';
import PodaciKartica from '@/components/PodaciKartica';
import TransakcijeTabela from '@/components/TransakcijeTabela';
import CijenaGrafikon from '@/components/CijenaGrafikon';
import { dohvatiTransakcije, dohvatiCijenuEthera } from '@/services/moralis';
import { FaExchangeAlt, FaCubes, FaEthereum, FaNetworkWired } from 'react-icons/fa';

export default async function Home() {
  // Dohvaćamo podatke za početnu stranicu
  const transakcije = await dohvatiTransakcije(undefined, 10);
  const cijenaEthera = await dohvatiCijenuEthera();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Dobrodošli na Kripto Transakcije - Hrvatski Blockchain Explorer
      </h1>
      
      <Pretrazivac />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PodaciKartica 
          naslov="Cijena Ethereuma" 
          vrijednost={`$${cijenaEthera.toLocaleString('hr-HR')}`} 
          ikona={<FaEthereum />} 
          boja="blue"
        />
        <PodaciKartica 
          naslov="Zadnji blok" 
          vrijednost="Učitavanje..." 
          ikona={<FaCubes />} 
          boja="green"
        />
        <PodaciKartica 
          naslov="Transakcije danas" 
          vrijednost="Učitavanje..." 
          ikona={<FaExchangeAlt />} 
          boja="purple"
        />
        <PodaciKartica 
          naslov="Gas cijena" 
          vrijednost="Učitavanje..." 
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
