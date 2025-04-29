'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function Pretrazivac() {
  const [upit, setUpit] = useState('');
  const [tipPretrage, setTipPretrage] = useState('sve');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upit.trim()) return;
    
    // Jednostavna provjera tipa upita
    if (tipPretrage === 'sve') {
      // Provjera je li upit hash transakcije (0x + 64 znaka)
      if (/^0x[a-fA-F0-9]{64}$/.test(upit)) {
        router.push(`/transakcije/${upit}`);
      } 
      // Provjera je li upit adresa (0x + 40 znakova)
      else if (/^0x[a-fA-F0-9]{40}$/.test(upit)) {
        router.push(`/adrese/${upit}`);
      } 
      // Provjera je li upit broj bloka
      else if (/^\d+$/.test(upit)) {
        router.push(`/blokovi/${upit}`);
      } 
      // Inače, pretpostavljamo da je token
      else {
        router.push(`/tokeni?pretraga=${encodeURIComponent(upit)}`);
      }
    } else {
      // Ako je korisnik odabrao specifičan tip pretrage
      router.push(`/${tipPretrage}/${encodeURIComponent(upit)}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={upit}
              onChange={(e) => setUpit(e.target.value)}
              placeholder="Pretraži po adresi, transakciji, bloku ili tokenu..."
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <select
          value={tipPretrage}
          onChange={(e) => setTipPretrage(e.target.value)}
          className="p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="sve">Sve</option>
          <option value="adrese">Adresa</option>
          <option value="transakcije">Transakcija</option>
          <option value="blokovi">Blok</option>
          <option value="tokeni">Token</option>
        </select>
        
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Pretraži
        </button>
      </form>
    </div>
  );
}
