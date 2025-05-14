import Link from 'next/link';
import { dohvatiAdresu, dohvatiTransakcije, dohvatiTokene, dohvatiCijenuEthera, dohvatiAdresuStatistiku } from '@/services/dune';
import { FaWallet, FaExchangeAlt, FaCoins, FaInfoCircle, FaGasPump } from 'react-icons/fa';
import TransakcijeTabela from '@/components/TransakcijeTabela';
import DuneEchoWrapper from '@/components/DuneEchoWrapper';

interface AdresaDetaljiProps {
  params: {
    adresa: string;
  };
}

// Ova funkcija govori Next.js koje statičke putanje treba generirati za ovu dinamičku rutu
export async function generateStaticParams() {
  // Generiramo nekoliko primjera adresa za statički export
  return [
    { adresa: '0x8ba1f109551bD432803012645Ac136ddd64DBA72' },
    { adresa: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
    { adresa: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }, // WETH adresa
    { adresa: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }, // USDC adresa
    { adresa: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }  // USDT adresa
  ];
}

export default async function AdresaDetalji({ params }: AdresaDetaljiProps) {
  const { adresa } = params;
  const adresaPodaci = await dohvatiAdresu(adresa);
  
  // Dohvaćamo više transakcija (20) i postavljamo fromBlock na 0 da dohvatimo i starije transakcije
  const transakcije = await dohvatiTransakcije(adresa, 20);
  
  const tokeni = await dohvatiTokene(adresa);
  const cijenaEthera = await dohvatiCijenuEthera();
  
  // Dohvaćamo statistiku adrese za detaljnije informacije
  const statistika = await dohvatiAdresuStatistiku(adresa);

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
  
  // Provjera je li adresa potencijalno ugovor (contract)
  const jeUgovor = adresaPodaci.isContract || false;
  
  // Dohvaćanje prve transakcije (za datum stvaranja)
  const prvaTransakcija = adresaPodaci.firstSeen ? new Date(adresaPodaci.firstSeen) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FaWallet className="text-purple-600" />
        <h1 className="text-2xl font-bold">Detalji adrese</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-purple-50 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm break-all">
              {adresa}
            </h2>
            {jeUgovor && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Ugovor
              </span>
            )}
          </div>
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
      
      {/* Dodatne informacije o adresi */}
      <div className="flex items-center space-x-2">
        <FaInfoCircle className="text-green-600" />
        <h2 className="text-xl font-semibold">Više informacija</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Pregled adrese</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 mb-2">Osnovne informacije</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="font-medium">{jeUgovor ? 'Ugovor' : 'Korisnički račun'}</span>
                </div>
                {jeUgovor && adresaPodaci.contractCreator && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kreator ugovora:</span>
                    <Link href={`/adrese/${adresaPodaci.contractCreator}`} className="font-medium text-blue-600 hover:underline">
                      {adresaPodaci.contractCreator.substring(0, 8)}...{adresaPodaci.contractCreator.substring(adresaPodaci.contractCreator.length - 6)}
                    </Link>
                  </div>
                )}
                {jeUgovor && adresaPodaci.contractCreationTx && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transakcija kreiranja:</span>
                    <Link href={`/transakcije/${adresaPodaci.contractCreationTx}`} className="font-medium text-blue-600 hover:underline">
                      {adresaPodaci.contractCreationTx.substring(0, 8)}...{adresaPodaci.contractCreationTx.substring(adresaPodaci.contractCreationTx.length - 6)}
                    </Link>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Prvo viđeno:</span>
                  <span className="font-medium">{prvaTransakcija ? prvaTransakcija.toLocaleDateString('hr-HR') : 'Nepoznato'}</span>
                </div>
                {adresaPodaci.lastSeen && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zadnja aktivnost:</span>
                    <span className="font-medium">{new Date(adresaPodaci.lastSeen).toLocaleDateString('hr-HR')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">ETH stanje:</span>
                  <span className="font-medium">{stanjeEth.toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USD vrijednost:</span>
                  <span className="font-medium">${stanjeUsd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ERC-20 tokeni:</span>
                  <span className="font-medium">{tokeni.length}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-500 mb-2">Statistika transakcija</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ukupno transakcija:</span>
                  <span className="font-medium">{adresaPodaci.nonce || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Poslano:</span>
                  <span className="font-medium">{statistika.poslanoTransakcija} transakcija</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primljeno:</span>
                  <span className="font-medium">{statistika.primljenoTransakcija} transakcija</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Poslano ETH:</span>
                  <span className="font-medium">{statistika.poslanoEth.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primljeno ETH:</span>
                  <span className="font-medium">{statistika.primljenoEth.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistika gasa */}
      <div className="flex items-center space-x-2">
        <FaGasPump className="text-red-600" />
        <h2 className="text-xl font-semibold">Statistika gasa</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Potrošnja gasa</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 mb-2">Ukupna potrošnja</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prosječni gas po transakciji:</span>
                  <span className="font-medium">{statistika.prosjecniGas.toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ukupno potrošeno za gas:</span>
                  <span className="font-medium">{statistika.ukupnoPotrosenoGas.toFixed(6)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USD vrijednost potrošenog gasa:</span>
                  <span className="font-medium">${(statistika.ukupnoPotrosenoGas * cijenaEthera).toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tokeni i Transakcije s Dune Echo Hooks */}
      <DuneEchoWrapper adresa={adresa} />
      
      {/* Tokeni - statički podaci */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tokeni (statički podaci)</h2>
        
        {tokeni.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Nema pronađenih tokena za ovu adresu</p>
        ) : (
          <div className="space-y-4">
            {tokeni.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="font-bold text-sm">{token.symbol.substring(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals))).toFixed(6)}</p>
                  {cijenaEthera && token.symbol === 'ETH' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${((parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals))) * cijenaEthera).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Transakcije - statički podaci */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Zadnje transakcije (statički podaci)</h2>
        <TransakcijeTabela transakcije={transakcije} />
      </div>
      
      {/* Transakcije */}
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
      
      {/* Tokeni */}
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
                  const tokenVrijednost = token.price ? parseFloat(token.price) * tokenStanje : null;
                  
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
                        {tokenVrijednost 
                          ? `$${tokenVrijednost.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : 'Nije dostupno'
                        }
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
