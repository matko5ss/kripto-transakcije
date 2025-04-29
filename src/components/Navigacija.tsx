'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaExchangeAlt, FaCubes, FaWallet, FaCoins } from 'react-icons/fa';

export default function Navigacija() {
  const pathname = usePathname();
  
  const navItems = [
    { naziv: 'Početna', putanja: '/', ikona: <FaHome className="mr-2" /> },
    { naziv: 'Transakcije', putanja: '/transakcije', ikona: <FaExchangeAlt className="mr-2" /> },
    { naziv: 'Blokovi', putanja: '/blokovi', ikona: <FaCubes className="mr-2" /> },
    { naziv: 'Adrese', putanja: '/adrese', ikona: <FaWallet className="mr-2" /> },
    { naziv: 'Tokeni', putanja: '/tokeni', ikona: <FaCoins className="mr-2" /> },
  ];

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Kripto Transakcije</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.putanja}
                  href={item.putanja}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.putanja
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.ikona}
                  {item.naziv}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobilna navigacija */}
      <div className="md:hidden">
        <div className="grid grid-cols-5 text-center border-t border-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.putanja}
              href={item.putanja}
              className={`flex flex-col items-center justify-center py-2 ${
                pathname === item.putanja
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="text-lg">{item.ikona}</div>
              <span className="text-xs">{item.naziv}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
