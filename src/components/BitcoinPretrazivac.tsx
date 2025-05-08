"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function BitcoinPretrazivac() {
  const [pretrazivanjeVrijednost, setPretrazivanjeVrijednost] = useState("");
  const [tipPretrazivanja, setTipPretrazivanja] = useState<"transakcija" | "blok" | "adresa">("transakcija");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Funkcija za validaciju i obradu pretrage
  const handlePretrazi = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prazan unos nije dopušten
    if (!pretrazivanjeVrijednost.trim()) {
      setError("Molimo unesite vrijednost za pretraživanje.");
      return;
    }

    const vrijednost = pretrazivanjeVrijednost.trim();

    // Validacija ovisno o tipu pretrage
    if (tipPretrazivanja === "transakcija") {
      // Bitcoin transaction hash (txid) je string od 64 heksadecimalna znaka
      if (!/^[a-fA-F0-9]{64}$/.test(vrijednost)) {
        setError("Bitcoin transaction hash mora biti 64 znaka dug heksadecimalni string.");
        return;
      }
      router.push(`/bitcoin/tx/${vrijednost}`);
    } else if (tipPretrazivanja === "blok") {
      // Možemo pretražiti blok po visini (broj) ili hash-u (64 heksadecimalna znaka)
      if (/^\d+$/.test(vrijednost)) {
        // Ako je broj, pretpostavljamo da je visina bloka
        router.push(`/bitcoin/blok/${vrijednost}`);
      } else if (/^[a-fA-F0-9]{64}$/.test(vrijednost)) {
        // Ako je hash, pretpostavljamo da je hash bloka
        router.push(`/bitcoin/blok/${vrijednost}`);
      } else {
        setError("Bitcoin blok mora biti broj ili 64 znaka dug heksadecimalni string.");
        return;
      }
    } else if (tipPretrazivanja === "adresa") {
      // Bitcoin adrese počinju s 1, 3, bc1 i obično su duge između 26 i 89 znakova
      if (!/^(1|3|bc1)[a-zA-Z0-9]{25,88}$/.test(vrijednost)) {
        setError("Bitcoin adresa nije u ispravnom formatu.");
        return;
      }
      router.push(`/bitcoin/adresa/${vrijednost}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Pretražite Bitcoin blockchain</h2>
      
      <form onSubmit={handlePretrazi} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="md:w-1/4">
            <div className="relative">
              <select
                value={tipPretrazivanja}
                onChange={(e) => setTipPretrazivanja(e.target.value as "transakcija" | "blok" | "adresa")}
                className="block w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="transakcija">
                  Transakcija
                </option>
                <option value="blok">
                  Blok
                </option>
                <option value="adresa">
                  Adresa
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex flex-1 items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={
                  tipPretrazivanja === "transakcija"
                    ? "Unesite Bitcoin transaction hash..."
                    : tipPretrazivanja === "blok"
                    ? "Unesite visinu bloka ili hash..."
                    : "Unesite Bitcoin adresu..."
                }
                value={pretrazivanjeVrijednost}
                onChange={(e) => setPretrazivanjeVrijednost(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {tipPretrazivanja === "transakcija" && (
            <p>Unesite Bitcoin transaction hash za pretraživanje detalja transakcije.</p>
          )}
          {tipPretrazivanja === "blok" && (
            <p>Unesite visinu bloka (npr. 790255) ili hash bloka za pretraživanje detalja bloka.</p>
          )}
          {tipPretrazivanja === "adresa" && (
            <p>Unesite Bitcoin adresu za pretraživanje povijesti transakcija.</p>
          )}
        </div>
      </form>
    </div>
  );
}
