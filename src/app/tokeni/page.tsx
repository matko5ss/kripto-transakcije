import Pretrazivac from '@/components/Pretrazivac';
import { FaCoins } from 'react-icons/fa';
import Link from 'next/link';

export default function TokeniPage() {
  // Ovo je statička stranica jer Moralis API nema endpoint za dohvaćanje popisa svih tokena
  // Za pravi popis tokena trebali bismo koristiti drugi API ili bazu podataka
  
  const popularniTokeni = [
    { ime: 'Tether USD', simbol: 'USDT', adresa: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    { ime: 'USD Coin', simbol: 'USDC', adresa: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
    { ime: 'BNB', simbol: 'BNB', adresa: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52' },
    { ime: 'Binance USD', simbol: 'BUSD', adresa: '0x4fabb145d64652a948d72533023f6e7a623c7c53' },
    { ime: 'Shiba Inu', simbol: 'SHIB', adresa: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' },
    { ime: 'Chainlink', simbol: 'LINK', adresa: '0x514910771af9ca656af840dff83e8264ecf986ca' },
    { ime: 'Dai Stablecoin', simbol: 'DAI', adresa: '0x6b175474e89094c44da98b954eedeac495271d0f' },
    { ime: 'Uniswap', simbol: 'UNI', adresa: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tokeni</h1>
      
      <Pretrazivac />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center space-x-2">
          <FaCoins className="text-yellow-600" />
          <h2 className="text-lg font-semibold">Popularni ERC-20 tokeni</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Simbol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresa ugovora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {popularniTokeni.map((token) => (
                <tr key={token.adresa} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{token.ime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{token.simbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono truncate max-w-xs">
                    <Link href={`/adrese/${token.adresa}`} className="text-blue-600 hover:underline">
                      {token.adresa}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">O Ethereum tokenima</h2>
        <p className="mb-3">
          Tokeni na Ethereum mreži su digitalna imovina koja se stvara i upravlja putem pametnih ugovora.
        </p>
        <p className="mb-3">
          Najčešći standardi tokena su:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li><strong>ERC-20</strong> - Standard za zamjenjive tokene (kriptovalute)</li>
          <li><strong>ERC-721</strong> - Standard za nezamjenjive tokene (NFT-ovi)</li>
          <li><strong>ERC-1155</strong> - Višenamjenski standard koji podržava i zamjenjive i nezamjenjive tokene</li>
        </ul>
        <p>
          Tokeni se mogu koristiti za različite svrhe, uključujući digitalne valute, glasačka prava u DAO organizacijama, 
          kolekcionarske predmete, igre, i mnoge druge primjene.
        </p>
      </div>
    </div>
  );
}
