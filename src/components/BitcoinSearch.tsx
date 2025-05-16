'use client';

import { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import {
  searchBitcoin,
  BitcoinAddressData,
  BitcoinTransactionData,
  BitcoinBlockData,
  BitcoinAddressTransactionData
} from '@/services/bitcoinDuneSearch';

// Definiramo tip za rezultate pretraživanja u komponenti
type BitcoinSearchResultType = {
  type: 'address' | 'transaction' | 'block' | 'address_transactions';
  data: BitcoinAddressData | BitcoinTransactionData | BitcoinBlockData | BitcoinAddressTransactionData[];
};

interface BitcoinSearchProps {
  onResultsFound?: (results: BitcoinSearchResultType) => void;
}

export default function BitcoinSearch({ onResultsFound }: BitcoinSearchProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<BitcoinSearchResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [addressTransactions, setAddressTransactions] = useState<BitcoinAddressTransactionData[] | null>(null);
  const [loadingTransactions] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Unesite adresu, hash transakcije ili visinu bloka');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    setAddressTransactions(null);
    
    try {
      // Koristimo novu searchBitcoin funkciju koja automatski prepoznaje tip upita
      const query = searchQuery.trim();
      const searchResult = await searchBitcoin(query);
      
      if (searchResult) {
        // Pretvaramo Dune rezultat u format koji komponenta očekuje
        const result: BitcoinSearchResultType = {
          type: searchResult.type,
          data: searchResult.data
        };
        
        setSearchResults(result);
        
        // Ako je rezultat adresa, automatski su dohvaćene i transakcije
        if (searchResult.type === 'address_transactions') {
          setAddressTransactions(searchResult.data as BitcoinAddressTransactionData[]);
        }
        
        if (onResultsFound) {
          onResultsFound(result);
        }
      } else {
        setError('Nije pronađen rezultat za uneseni upit');
      }
    } catch (error) {
      console.error('Greška pri pretraživanju:', error);
      setError('Došlo je do greške pri pretraživanju. Pokušajte ponovno.');
    } finally {
      setIsSearching(false);
    }
  };

  // Removed unused fetchAddressTransactions function

  const renderAddressResults = (data: BitcoinAddressData) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Adresa</span>
          {data.address}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border-b pb-2">
            <span className="text-gray-500">Stanje:</span>
            <span className="font-semibold ml-2">{data.balance} BTC</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Broj transakcija:</span>
            <span className="font-semibold ml-2">{data.tx_count}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Ukupno primljeno:</span>
            <span className="font-semibold ml-2">{data.received} BTC</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Ukupno poslano:</span>
            <span className="font-semibold ml-2">{data.sent} BTC</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Prvi put viđeno:</span>
            <span className="font-semibold ml-2">{new Date(data.first_seen * 1000).toLocaleString('hr-HR')}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Zadnji put viđeno:</span>
            <span className="font-semibold ml-2">{new Date(data.last_seen * 1000).toLocaleString('hr-HR')}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTransactionResults = (data: BitcoinTransactionData) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Transakcija</span>
          {data.txid}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border-b pb-2">
            <span className="text-gray-500">Blok:</span>
            <span className="font-semibold ml-2">{data.block_height}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Vrijeme:</span>
            <span className="font-semibold ml-2">{new Date(data.block_time * 1000).toLocaleString('hr-HR')}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Naknada:</span>
            <span className="font-semibold ml-2">{data.fee} BTC</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Broj ulaza:</span>
            <span className="font-semibold ml-2">{data.input_count}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Broj izlaza:</span>
            <span className="font-semibold ml-2">{data.output_count}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Ukupno ulaza:</span>
            <span className="font-semibold ml-2">{data.input_value} BTC</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Ukupno izlaza:</span>
            <span className="font-semibold ml-2">{data.output_value} BTC</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBlockResults = (data: BitcoinBlockData) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Blok</span>
          {data.height} - {data.hash}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border-b pb-2">
            <span className="text-gray-500">Vrijeme:</span>
            <span className="font-semibold ml-2">{new Date(data.time * 1000).toLocaleString('hr-HR')}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Broj transakcija:</span>
            <span className="font-semibold ml-2">{data.tx_count}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Veličina:</span>
            <span className="font-semibold ml-2">{data.size} bytes</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Težina:</span>
            <span className="font-semibold ml-2">{data.weight}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Verzija:</span>
            <span className="font-semibold ml-2">{data.version}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Merkle root:</span>
            <span className="font-semibold ml-2">{data.merkle_root}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Bits:</span>
            <span className="font-semibold ml-2">{data.bits}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Nonce:</span>
            <span className="font-semibold ml-2">{data.nonce}</span>
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-500">Težina:</span>
            <span className="font-semibold ml-2">{data.difficulty}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAddressTransactions = (transactions: BitcoinAddressTransactionData[]) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Transakcije adrese</span>
          {transactions.length > 0 ? transactions[0].address : ''}
        </h3>
        
        {loadingTransactions ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-orange-500" />
            <span className="ml-2 text-gray-600">Učitavanje transakcija...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4 text-left">Transakcija</th>
                  <th className="py-2 px-4 text-left">Vrijeme</th>
                  <th className="py-2 px-4 text-left">Tip</th>
                  <th className="py-2 px-4 text-right">Vrijednost (BTC)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <tr key={tx.txid + index} className={`border-b ${tx.is_input ? 'bg-red-50' : 'bg-green-50'}`}>
                      <td className="py-2 px-4">
                        <a 
                          href={`#${tx.txid}`} 
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchQuery(tx.txid);
                            handleSearch(e as React.FormEvent);
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          {tx.txid.substring(0, 8)}...{tx.txid.substring(tx.txid.length - 8)}
                        </a>
                      </td>
                      <td className="py-2 px-4">{new Date(tx.block_time * 1000).toLocaleString('hr-HR')}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tx.is_input ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {tx.is_input ? 'Poslano' : 'Primljeno'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono">
                        <span className={tx.is_input ? 'text-red-500' : 'text-green-500'}>
                          {tx.is_input ? '-' : '+'}{tx.value}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      Nema dostupnih transakcija za ovu adresu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Unesite adresu, hash transakcije ili visinu bloka"
            className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-bitcoin"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
        <button 
          type="submit"
          disabled={isSearching}
          className="bg-bitcoin hover:bg-bitcoin-dark text-white px-6 py-3 rounded flex items-center justify-center"
        >
          {isSearching ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Pretraživanje...
            </>
          ) : (
            'Pretraži'
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          <p>{error}</p>
        </div>
      )}

      {searchResults && searchResults.type === 'address' && renderAddressResults(searchResults.data as BitcoinAddressData)}
      {searchResults && searchResults.type === 'transaction' && renderTransactionResults(searchResults.data as BitcoinTransactionData)}
      {searchResults && searchResults.type === 'block' && renderBlockResults(searchResults.data as BitcoinBlockData)}
      {searchResults && searchResults.type === 'address_transactions' && renderAddressTransactions(searchResults.data as BitcoinAddressTransactionData[])}
      
      {addressTransactions && addressTransactions.length > 0 && !searchResults?.type.includes('address_transactions') && (
        renderAddressTransactions(addressTransactions)
      )}
    </div>
  );
}
