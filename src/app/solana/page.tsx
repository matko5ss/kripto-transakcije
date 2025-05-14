"use client";

import { useState } from "react";
import Pretrazivac from "@/components/Pretrazivac";
import SolanaStatusSimple from "@/components/SolanaStatusSimple";
import { FaInfoCircle } from "react-icons/fa";

export default function SolanaPage() {
  const [searchMode, setSearchMode] = useState<"adresa" | "transakcija" | "blok">("adresa");

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Solana Blockchain Explorer
      </h1>

      {/* Pretraživač prilagođen za Solana mrežu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Pretraži Solana mrežu</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="adresa"
                name="searchMode"
                value="adresa"
                checked={searchMode === "adresa"}
                onChange={() => setSearchMode("adresa")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="adresa"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Adresa
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="transakcija"
                name="searchMode"
                value="transakcija"
                checked={searchMode === "transakcija"}
                onChange={() => setSearchMode("transakcija")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="transakcija"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Transakcija
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="blok"
                name="searchMode"
                value="blok"
                checked={searchMode === "blok"}
                onChange={() => setSearchMode("blok")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="blok"
                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Slot/Blok
              </label>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full p-4 pl-4 pr-12 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={
                  searchMode === "adresa"
                    ? "Unesite Solana adresu..."
                    : searchMode === "transakcija"
                    ? "Unesite hash transakcije..."
                    : "Unesite broj slota..."
                }
              />
              <button
                type="submit"
                className="absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Pretraži
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Solana Status komponenta */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Stanje Solana mreže u stvarnom vremenu</h2>
          <div className="text-sm text-gray-500 flex items-center">
            <span>Osvježava se automatski svakih 10s</span>
          </div>
        </div>
        
        <SolanaStatusSimple />
      </div>

      {/* Informativni blok - u razvoju */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FaInfoCircle className="text-blue-500 text-xl" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">
              Solana Explorer u razvoju
            </h3>
            <div className="mt-2 text-blue-700 dark:text-blue-400">
              <p>
                Ova stranica je trenutno u razvoju. Uskoro ćemo dodati sljedeće funkcionalnosti:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pregled detalja adrese i stanja tokena</li>
                <li>Pregled detalja transakcije</li>
                <li>Pregled detalja slota/bloka</li>
                <li>Pregled programa i pametnih ugovora</li>
                <li>Analitika i statistika Solana mreže</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder za buduće komponente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Popularni tokeni na Solani</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Popis popularnih tokena bit će dostupan uskoro.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Zadnje transakcije</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Popis zadnjih transakcija bit će dostupan uskoro.
          </p>
        </div>
      </div>
    </div>
  );
}
