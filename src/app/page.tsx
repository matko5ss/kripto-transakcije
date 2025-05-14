"use client";

import Link from 'next/link';
import { useState, useEffect } from "react";
import { FaEthereum, FaBitcoin, FaArrowRight } from "react-icons/fa";
import { SiSolana, SiCardano, SiDogecoin, SiLitecoin } from "react-icons/si";
import { 
  TbCurrency, 
  TbBrandBinance
} from "react-icons/tb";

// Definicija tipa za blockchain
interface Blockchain {
  id: string;
  name: string;
  symbol: string;
  logo: React.ReactNode;
  color: string;
  route: string;
}

export default function Home() {
  const [blockchains, setBlockchains] = useState<Blockchain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulacija dohvaćanja podataka o top 20 blockchainova
    const fetchBlockchainData = () => {
      setLoading(true);
      
      // Top 20 blockchainova s osnovnim podacima
      const topBlockchains: Blockchain[] = [
        {
          id: "ethereum",
          name: "Ethereum",
          symbol: "ETH",
          logo: <FaEthereum size={24} />,
          color: "bg-blue-500",
          route: "/ethereum"
        },
        {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "BTC",
          logo: <FaBitcoin size={24} />,
          color: "bg-orange-500",
          route: "/bitcoin"
        },
        {
          id: "binance",
          name: "Binance Smart Chain",
          symbol: "BNB",
          logo: <TbBrandBinance size={24} />,
          color: "bg-yellow-500",
          route: "/binance"
        },
        {
          id: "solana",
          name: "Solana",
          symbol: "SOL",
          logo: <SiSolana size={24} />,
          color: "bg-purple-500",
          route: "/solana"
        },
        {
          id: "cardano",
          name: "Cardano",
          symbol: "ADA",
          logo: <SiCardano size={24} />,
          color: "bg-blue-700",
          route: "/cardano"
        },
        {
          id: "polygon",
          name: "Polygon",
          symbol: "MATIC",
          logo: <TbCurrency size={24} />,
          color: "bg-purple-600",
          route: "/polygon"
        },
        {
          id: "avalanche",
          name: "Avalanche",
          symbol: "AVAX",
          logo: <TbCurrency size={24} />,
          color: "bg-red-500",
          route: "/avalanche"
        },
        {
          id: "polkadot",
          name: "Polkadot",
          symbol: "DOT",
          logo: <TbCurrency size={24} />,
          color: "bg-pink-500",
          route: "/polkadot"
        },
        {
          id: "dogecoin",
          name: "Dogecoin",
          symbol: "DOGE",
          logo: <SiDogecoin size={24} />,
          color: "bg-yellow-400",
          route: "/dogecoin"
        },
        {
          id: "litecoin",
          name: "Litecoin",
          symbol: "LTC",
          logo: <SiLitecoin size={24} />,
          color: "bg-gray-500",
          route: "/litecoin"
        },
        {
          id: "cosmos",
          name: "Cosmos",
          symbol: "ATOM",
          logo: <TbCurrency size={24} />,
          color: "bg-indigo-500",
          route: "/cosmos"
        },
        {
          id: "algorand",
          name: "Algorand",
          symbol: "ALGO",
          logo: <TbCurrency size={24} />,
          color: "bg-green-600",
          route: "/algorand"
        },
        {
          id: "stellar",
          name: "Stellar",
          symbol: "XLM",
          logo: <TbCurrency size={24} />,
          color: "bg-blue-400",
          route: "/stellar"
        },
        {
          id: "tron",
          name: "TRON",
          symbol: "TRX",
          logo: <TbCurrency size={24} />,
          color: "bg-red-600",
          route: "/tron"
        },
        {
          id: "tezos",
          name: "Tezos",
          symbol: "XTZ",
          logo: <TbCurrency size={24} />,
          color: "bg-blue-800",
          route: "/tezos"
        },
        {
          id: "flow",
          name: "Flow",
          symbol: "FLOW",
          logo: <TbCurrency size={24} />,
          color: "bg-green-500",
          route: "/flow"
        },
        {
          id: "near",
          name: "NEAR Protocol",
          symbol: "NEAR",
          logo: <TbCurrency size={24} />,
          color: "bg-black",
          route: "/near"
        },
        {
          id: "fantom",
          name: "Fantom",
          symbol: "FTM",
          logo: <TbCurrency size={24} />,
          color: "bg-blue-300",
          route: "/fantom"
        },
        {
          id: "filecoin",
          name: "Filecoin",
          symbol: "FIL",
          logo: <TbCurrency size={24} />,
          color: "bg-gray-400",
          route: "/filecoin"
        }
      ];
      
      setBlockchains(topBlockchains);
      setLoading(false);
    };

    fetchBlockchainData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">
        Blockchain Tražilice
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
        Istražite top 20 blockchain mreža i njihove transakcije
      </p>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {blockchains.map((blockchain) => (
            <Link
              key={blockchain.id}
              href={blockchain.route}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-700 group"
            >
              <div className={`${blockchain.color} h-2 w-full`}></div>
              <div className="p-4 flex-grow flex flex-col items-center justify-center text-center">
                <div className={`${blockchain.color} p-3 rounded-full text-white mb-3`}>
                  {blockchain.logo}
                </div>
                <h3 className="font-bold text-lg group-hover:text-blue-500 transition-colors">
                  {blockchain.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {blockchain.symbol}
                </p>
                
                <div className="mt-2 text-blue-500 flex items-center justify-center text-sm">
                  {blockchain.id === "ethereum" || blockchain.id === "bitcoin" || blockchain.id === "solana" ? "Istražite transakcije" : "Uskoro dostupno"}
                  <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
        <p className="mb-2">
          Trenutno su potpuno funkcionalne Ethereum, Bitcoin i Solana tražilice. Ostale blockchain tražilice bit će dostupne uskoro.
        </p>
        <p>
          &copy; {new Date().getFullYear()} Kripto Transakcije - Sva prava pridržana
        </p>
      </div>
    </div>
  );
}
