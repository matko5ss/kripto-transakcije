import Link from 'next/link';
import { dohvatiBlok, dohvatiTransakcije } from '@/services/moralis';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { FaCube, FaExchangeAlt } from 'react-icons/fa';
import TransakcijeTabela from '@/components/TransakcijeTabela';

interface BlokDetaljiProps {
  params: {
    broj: string;
  };
}

export default async function BlokDetalji({ params }: BlokDetaljiProps) {
  const { broj } = params;
  const blok = await dohvatiBlok(broj);
  
  // Dohvaćamo transakcije za ovaj blok
  const transakcije = await dohvatiTransakcije(undefined, 10);
  // Filtriramo samo transakcije koje pripadaju ovom bloku
  const blokTransakcije = transakcije.filter(tx => tx.blockNumber === broj);

  if (!blok) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Blok nije pronađen</h1>
        <p className="mb-4">Nismo mogli pronaći blok s brojem: {broj}</p>
        <Link href="/blokovi" className="text-blue-600 hover:underline">
          Povratak na popis blokova
        </Link>
      </div>
    );
  }

  // Funkcija za formatiranje vremena
  const formatirajVrijeme = (timestamp: string) => {
    try {
      const datum = new Date(timestamp);
      return {
        relativno: formatDistanceToNow(datum, { addSuffix: true, locale: hr }),
        apsolutno: datum.toLocaleString('hr-HR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
    } catch {
      return { relativno: timestamp, apsolutno: timestamp };
    }
  };

  const vrijeme = formatirajVrijeme(blok.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FaCube className="text-green-600" />
        <h1 className="text-2xl font-bold">Detalji bloka</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-green-50 border-b">
          <h2 className="font-semibold">
            Blok #{broj}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 mb-1">Vrijeme</h3>
              <div>
                <div>{vrijeme.relativno}</div>
                <div className="text-sm text-gray-500">{vrijeme.apsolutno}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Transakcije</h3>
              <div className="font-semibold">{blok.transactions.length}</div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-gray-500 mb-1">Hash bloka</h3>
              <div className="font-mono text-sm break-all">
                {blok.hash}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-gray-500 mb-1">Parent Hash</h3>
              <div className="font-mono text-sm break-all">
                {blok.parentHash ? (
                  <Link href={`/blokovi/${parseInt(broj) - 1}`} className="text-blue-600 hover:underline">
                    {blok.parentHash}
                  </Link>
                ) : (
                  <span className="text-gray-500">Nije dostupno</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Rudar</h3>
              {blok.miner ? (
                <Link href={`/adrese/${blok.miner}`} className="text-blue-600 hover:underline break-all">
                  {blok.miner}
                </Link>
              ) : (
                <span className="text-gray-500">Nije dostupno</span>
              )}
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Težina</h3>
              <div>{blok.difficulty || 'Nije dostupno'}</div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Gas limit</h3>
              <div>{blok.gasLimit || 'Nije dostupno'}</div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Gas korišten</h3>
              <div>{blok.gasUsed || 'Nije dostupno'}</div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Nonce</h3>
              <div className="font-mono">{blok.nonce || 'Nije dostupno'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <FaExchangeAlt className="text-blue-600" />
        <h2 className="text-xl font-semibold">Transakcije u bloku</h2>
      </div>
      
      <TransakcijeTabela 
        transakcije={blokTransakcije} 
        naslov={`Transakcije u bloku #${broj}`} 
      />
      
      <div className="flex justify-center mt-6">
        <Link href="/blokovi" className="text-blue-600 hover:underline">
          Povratak na popis blokova
        </Link>
      </div>
    </div>
  );
}
