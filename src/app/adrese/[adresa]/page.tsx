import Link from 'next/link';
import { dohvatiAdresu, dohvatiTransakcije, dohvatiTokene, dohvatiCijenuEthera } from '@/services/moralis';
import { FaWallet, FaExchangeAlt, FaCoins } from 'react-icons/fa';
import TransakcijeTabela from '@/components/TransakcijeTabela';

interface AdresaDetaljiProps {
  params: {
    adresa: string;
  };
}

export default async function AdresaDetalji({ params }: AdresaDetaljiProps) {
  const { adresa } = params;
  const adresaPodaci = await dohvatiAdresu(adresa);
  
  // Dohvaćamo više transakcija (20) i postavljamo fromBlock na 0 da dohvatimo i starije transakcije
  const transakcije = await dohvatiTransakcije(adresa, 20);
  
  const tokeni = await dohvatiTokene(adresa);
  const cijenaEthera = await dohvatiCijenuEthera();

  if (!adresaPodaci) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Adresa nije pronađena</h1>
        <p className="mb-4">Nismo mogli pronaći podatke za adresu: {adresa}</p>
        <Link href="/adrese" className="text-blue-600 hover:underline">
          Povratak na pretragu adresa
        </Link>
      </div>
    );
  }

  // Formatiranje ETH vrijednosti
  const stanjeEth = parseFloat(adresaPodaci.balance) / 1e18;
  const stanjeUsd = stanjeEth * cijenaEthera;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FaWallet className="text-purple-600" />
        <h1 className="text-2xl font-bold">Detalji adrese</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-purple-50 border-b">
          <h2 className="font-mono text-sm break-all">
            {adresa}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 mb-1">ETH stanje</h3>
              <div className="text-2xl font-bold">{stanjeEth.toFixed(6)} ETH</div>
              <div className="text-sm text-gray-500">${stanjeUsd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-1">Broj transakcija</h3>
              <div className="text-2xl font-bold">{adresaPodaci.nonce || '0'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <FaExchangeAlt className="text-blue-600" />
        <h2 className="text-xl font-semibold">Transakcije</h2>
      </div>
      
      {transakcije.length > 0 ? (
        <TransakcijeTabela 
          transakcije={transakcije} 
          naslov={`Transakcije za adresu ${adresa.substring(0, 6)}...${adresa.substring(adresa.length - 4)}`} 
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-2">Nema pronađenih transakcija za ovu adresu.</p>
          <p className="text-sm text-gray-400">
            Napomena: Prikazujemo transakcije iz cijele povijesti blockchain-a. Ako i dalje ne vidite svoje transakcije, 
            moguće je da koristite adresu koja još nije imala transakcije na Ethereum mreži.
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <FaCoins className="text-yellow-600" />
        <h2 className="text-xl font-semibold">Tokeni</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">ERC-20 tokeni</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stanje
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vrijednost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ugovor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokeni.length > 0 ? (
                tokeni.map((token) => {
                  const tokenStanje = parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals));
                  
                  return (
                    <tr key={token.contractAddress} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{token.name}</div>
                            <div className="text-sm text-gray-500">{token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tokenStanje.toLocaleString('hr-HR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Nije dostupno
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono truncate max-w-xs">
                        <Link href={`/adrese/${token.contractAddress}`} className="text-blue-600 hover:underline">
                          {token.contractAddress}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nema dostupnih tokena
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-center mt-6">
        <Link href="/adrese" className="text-blue-600 hover:underline">
          Povratak na pretragu adresa
        </Link>
      </div>
    </div>
  );
}
