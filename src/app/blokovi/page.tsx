import Pretrazivac from '@/components/Pretrazivac';
import { dohvatiBlokove } from '@/services/moralis';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { FaCubes } from 'react-icons/fa';

export default async function BlokoviPage() {
  // Dohvaćamo zadnjih 15 blokova
  const blokovi = await dohvatiBlokove(15);

  // Funkcija za formatiranje vremena
  const formatirajVrijeme = (timestamp: string) => {
    try {
      const datum = new Date(timestamp);
      return formatDistanceToNow(datum, { addSuffix: true, locale: hr });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Blokovi</h1>
      
      <Pretrazivac />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center space-x-2">
          <FaCubes className="text-green-600" />
          <h2 className="text-lg font-semibold">Zadnji blokovi na Ethereum mreži</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Broj bloka
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vrijeme
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transakcije
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blokovi.length > 0 ? (
                blokovi.map((blok) => (
                  <tr key={blok.number} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/blokovi/${blok.number}`} className="text-blue-600 hover:underline">
                        {blok.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatirajVrijeme(blok.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {blok.transactions.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm truncate max-w-xs">
                      <Link href={`/blokovi/${blok.number}`} className="text-blue-600 hover:underline">
                        {blok.hash}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nema dostupnih blokova
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">O Ethereum blokovima</h2>
        <p className="mb-3">
          Blokovi su osnovne jedinice Ethereum blockchain-a koje sadrže transakcije i druge podatke.
        </p>
        <p className="mb-3">
          Svaki blok sadrži sljedeće ključne informacije:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li>Broj bloka - jedinstveni redni broj bloka</li>
          <li>Hash bloka - jedinstveni identifikator izračunat iz sadržaja bloka</li>
          <li>Vrijeme - kada je blok kreiran</li>
          <li>Transakcije - popis transakcija uključenih u blok</li>
          <li>Rudar - adresa koja je potvrdila blok</li>
          <li>Gas limit i Gas used - ograničenja i stvarna potrošnja resursa</li>
        </ul>
        <p>
          Novi blokovi se dodaju na Ethereum blockchain otprilike svakih 12-14 sekundi, a svaki blok može sadržavati više transakcija.
        </p>
      </div>
    </div>
  );
}
