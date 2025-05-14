"use client";

import React, { useState } from 'react';
import PythonBitcoinTransactionSearch from './PythonBitcoinTransactionSearch';
import PythonBitcoinTransactionDetails from './PythonBitcoinTransactionDetails';

export default function PythonBitcoinTransactionSearchContainer() {
  const [searchedTxHash, setSearchedTxHash] = useState<string | null>(null);

  // Funkcija koja se poziva kada korisnik pretraži transakciju
  const handleSearch = (hash: string) => {
    setSearchedTxHash(hash);
  };

  return (
    <div className="space-y-6">
      <PythonBitcoinTransactionSearch onSearch={handleSearch} />
      
      {searchedTxHash && (
        <PythonBitcoinTransactionDetails transactionHash={searchedTxHash} />
      )}
    </div>
  );
}
