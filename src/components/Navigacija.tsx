'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaExchangeAlt, FaCubes, FaWallet, FaCoins, FaEthereum, FaBitcoin } from 'react-icons/fa';

export default function Navigacija() {
  const pathname = usePathname();
  
  // Determing if we're in the Ethereum explorer section
  const isEthereumSection = pathname.startsWith('/ethereum') || 
                           pathname.startsWith('/transakcije') || 
                           pathname.startsWith('/blokovi') || 
                           pathname.startsWith('/adrese') || 
                           pathname.startsWith('/tokeni');
  
  // Determine if we're in the Bitcoin explorer section
  const isBitcoinSection = pathname.startsWith('/bitcoin');

  // Different navigation items based on where we are in the app  
  const mainNavItems = [
    { naziv: 'Svi Blockchaini', putanja: '/', ikona: <FaHome className="mr-2" /> },
    { naziv: 'Ethereum Explorer', putanja: '/ethereum', ikona: <FaEthereum className="mr-2" /> },
    { naziv: 'Bitcoin Explorer', putanja: '/bitcoin', ikona: <FaBitcoin className="mr-2" /> },
  ];
  
  const ethereumNavItems = [
    { naziv: 'ETH Početna', putanja: '/ethereum', ikona: <FaHome className="mr-2" /> },
    { naziv: 'Transakcije', putanja: '/transakcije', ikona: <FaExchangeAlt className="mr-2" /> },
    { naziv: 'Blokovi', putanja: '/blokovi', ikona: <FaCubes className="mr-2" /> },
    { naziv: 'Adrese', putanja: '/adrese', ikona: <FaWallet className="mr-2" /> },
    { naziv: 'Tokeni', putanja: '/tokeni', ikona: <FaCoins className="mr-2" /> },
  ];
  
  const bitcoinNavItems = [
    { naziv: 'BTC Početna', putanja: '/bitcoin', ikona: <FaHome className="mr-2" /> },
    { naziv: 'Transakcije', putanja: '/bitcoin/transakcije', ikona: <FaExchangeAlt className="mr-2" /> },
    { naziv: 'Blokovi', putanja: '/bitcoin/blokovi', ikona: <FaCubes className="mr-2" /> },
    { naziv: 'Adrese', putanja: '/bitcoin/adrese', ikona: <FaWallet className="mr-2" /> },
  ];
  
  // Choose which nav items to display based on section
  let navItems = mainNavItems;
  if (isEthereumSection) {
    navItems = ethereumNavItems;
  } else if (isBitcoinSection) {
    navItems = bitcoinNavItems;
  }

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold mr-2">Blockchain Tražilice</span>
              {isEthereumSection && (
                <span className="bg-blue-500 text-xs font-bold px-2 py-1 rounded-md">
                  ETHEREUM
                </span>
              )}
              {isBitcoinSection && (
                <span className="bg-orange-500 text-xs font-bold px-2 py-1 rounded-md">
                  BITCOIN
                </span>
              )}
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.putanja}
                  href={item.putanja}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    (pathname === item.putanja || 
                    (item.putanja === '/ethereum' && isEthereumSection && pathname !== '/ethereum') ||
                    (item.putanja === '/bitcoin' && isBitcoinSection && pathname !== '/bitcoin'))
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
                (pathname === item.putanja || 
                (item.putanja === '/ethereum' && isEthereumSection && pathname !== '/ethereum') ||
                (item.putanja === '/bitcoin' && isBitcoinSection && pathname !== '/bitcoin'))
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="text-lg">{item.ikona}</div>
              <span className="text-xs">{item.naziv}</span>
            </Link>
          ))}
          {/* Fill any extra columns with empty divs if we have fewer than 5 items */}
          {[...Array(Math.max(0, 5 - navItems.length))].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-2"></div>
          ))}
        </div>
      </div>
    </nav>
  );
}
