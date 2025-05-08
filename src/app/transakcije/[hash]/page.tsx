import Link from 'next/link';
import { dohvatiTransakciju } from '@/services/dune';
import { formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';
import { FaExchangeAlt } from 'react-icons/fa';

interface TransakcijaDetaljiProps {
  params: {
    hash: string;
  };
}

// Ova funkcija govori Next.js koje statičke putanje treba generirati za ovu dinamičku rutu
export async function generateStaticParams() {
  // Generiramo nekoliko primjera transakcija za statički export
  return [
    { hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111' },
    { hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2222' },
    { hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3333' },
    { hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4444' },
    { hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5555' },
    // Dodajemo hash koji nedostaje u error poruci
    { hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234' }
  ];
}

export default async function TransakcijaDetalji({ params }: TransakcijaDetaljiProps) {
  const { hash } = params;
  
  try {
    const transakcija = await dohvatiTransakciju(hash);

    if (!transakcija) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Transakcija nije pronađena</h1>
          <p className="mb-4">Nismo mogli pronaći transakciju s hash-om: {hash}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Povratak na početnu stranicu
          </Link>
        </div>
      );
    }

    // Funkcija za formatiranje vrijednosti u ETH
    const formatirajEth = (vrijednost: string) => {
      const eth = parseFloat(vrijednost) / 1e18;
      return eth.toFixed(6);
    };

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

    const vrijeme = formatirajVrijeme(transakcija.blockTimestamp);
    const vrijednostEth = formatirajEth(transakcija.value);
    const naknadaEth = (
      parseFloat(transakcija.gas) * parseFloat(transakcija.gasPrice) / 1e18
    ).toFixed(8);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <FaExchangeAlt className="text-blue-600" />
          <h1 className="text-2xl font-bold">Detalji transakcije</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-blue-50 border-b">
            <h2 className="font-mono text-sm break-all">
              {hash}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500 mb-1">Status</h3>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block">
                  Uspješno
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-500 mb-1">Blok</h3>
                <Link href={`/blokovi/${transakcija.blockNumber}`} className="text-blue-600 hover:underline">
                  {transakcija.blockNumber}
                </Link>
              </div>
              
              <div>
                <h3 className="text-gray-500 mb-1">Vrijeme</h3>
                <div>
                  <div>{vrijeme.relativno}</div>
                  <div className="text-sm text-gray-500">{vrijeme.apsolutno}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-500 mb-1">Vrijednost</h3>
                <div className="font-semibold">{vrijednostEth} ETH</div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-gray-500 mb-1">Od</h3>
                <Link href={`/adrese/${transakcija.from}`} className="text-blue-600 hover:underline break-all">
                  {transakcija.from}
                </Link>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-gray-500 mb-1">Za</h3>
                {transakcija.to ? (
                  <Link href={`/adrese/${transakcija.to}`} className="text-blue-600 hover:underline break-all">
                    {transakcija.to}
                  </Link>
                ) : (
                  <span className="text-gray-500">Kreiranje ugovora</span>
                )}
              </div>
              
              <div>
                <h3 className="text-gray-500 mb-1">Naknada za transakciju</h3>
                <div>{naknadaEth} ETH</div>
              </div>
              
              <div>
                <h3 className="text-gray-500 mb-1">Gas cijena</h3>
                <div>{(parseFloat(transakcija.gasPrice) / 1e9).toFixed(2)} Gwei</div>
              </div>
              
              <div>
                <h3 className="text-gray-500 mb-1">Gas limit</h3>
                <div>{transakcija.gas}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Povratak na početnu stranicu
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcije:', error);
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Transakcija nije pronađena</h1>
        <p className="mb-4">Nismo mogli pronaći transakciju s hash-om: {hash}</p>
        <p className="text-sm text-red-500 mb-4">Greška: {error instanceof Error ? error.message : 'Nepoznata greška'}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Povratak na početnu stranicu
        </Link>
      </div>
    );
  }
}
