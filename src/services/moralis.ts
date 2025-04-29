import axios from 'axios';
import { MORALIS_API_KEY, MORALIS_BASE_URL } from '../../config/moralis';

// Konfiguracija Axios instance za Moralis API
const moralisApi = axios.create({
  baseURL: MORALIS_BASE_URL,
  headers: {
    'X-API-Key': MORALIS_API_KEY,
    'Accept': 'application/json'
  }
});

// Fiksni datumi za mock podatke kako bi se izbjegao problem hidracije
const mockDatumi = [
  '2025-04-29T09:30:00.000Z',
  '2025-04-29T09:25:00.000Z',
  '2025-04-29T09:20:00.000Z',
  '2025-04-29T09:15:00.000Z',
  '2025-04-29T09:10:00.000Z',
  '2025-04-29T09:05:00.000Z',
  '2025-04-29T09:00:00.000Z',
  '2025-04-29T08:55:00.000Z',
  '2025-04-29T08:50:00.000Z',
  '2025-04-29T08:45:00.000Z',
];

// Tipovi podataka
export interface Transakcija {
  hash: string;
  blockNumber: string;
  blockTimestamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  blockHash?: string;
}

export interface Blok {
  number: string;
  timestamp: string;
  hash: string;
  parentHash: string;
  nonce: string;
  difficulty: string;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  transactions: string[];
}

export interface Adresa {
  balance: string;
  nonce: string;
}

export interface Token {
  name: string;
  symbol: string;
  decimals: string;
  contractAddress: string;
  balance: string;
}

// Tip za rezultat transakcije iz Moralis API-ja
interface MoralisTransakcija {
  hash: string;
  block_number: string;
  block_timestamp: string;
  from_address: string;
  to_address: string;
  value: string;
  gas: string;
  gas_price: string;
}

// Funkcije za dohvaćanje podataka
export async function dohvatiTransakcije(adresa?: string, limit: number = 10): Promise<Transakcija[]> {
  try {
    if (adresa) {
      // Za adresu, koristimo endpoint za dohvaćanje transakcija adrese
      try {
        // Dohvaćamo transakcije za adresu
        const txResponse = await moralisApi.get(`/${adresa}/verbose`, {
          params: {
            chain: 'eth',
            limit: limit,
            // Dohvaćamo i poslane i primljene transakcije
            direction: 'both'
          }
        });
        
        if (txResponse.data && Array.isArray(txResponse.data.result)) {
          return txResponse.data.result.map((tx: MoralisTransakcija) => ({
            hash: tx.hash,
            blockNumber: tx.block_number,
            blockTimestamp: tx.block_timestamp,
            from: tx.from_address,
            to: tx.to_address,
            value: tx.value,
            gas: tx.gas || '0',
            gasPrice: tx.gas_price || '0'
          }));
        }
        
        return [];
      } catch (error) {
        console.error('Greška pri dohvaćanju transakcija za adresu:', error);
        return [];
      }
    } else {
      // Za opći pregled, koristimo mock podatke jer Moralis API ne podržava dohvaćanje općih transakcija bez adrese
      const mockTransakcije: Transakcija[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          blockNumber: '12345678',
          blockTimestamp: mockDatumi[0],
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          value: '1000000000000000000', // 1 ETH
          gas: '21000',
          gasPrice: '20000000000'
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          blockNumber: '12345677',
          blockTimestamp: mockDatumi[1],
          from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          value: '500000000000000000', // 0.5 ETH
          gas: '21000',
          gasPrice: '20000000000'
        },
        {
          hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
          blockNumber: '12345676',
          blockTimestamp: mockDatumi[2],
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT token
          value: '0',
          gas: '65000',
          gasPrice: '25000000000'
        },
        {
          hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
          blockNumber: '12345675',
          blockTimestamp: mockDatumi[3],
          from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          value: '2000000000000000000', // 2 ETH
          gas: '21000',
          gasPrice: '20000000000'
        },
        {
          hash: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
          blockNumber: '12345674',
          blockTimestamp: mockDatumi[4],
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          to: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI token
          value: '0',
          gas: '65000',
          gasPrice: '25000000000'
        },
        {
          hash: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
          blockNumber: '12345673',
          blockTimestamp: mockDatumi[5],
          from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          value: '1500000000000000000', // 1.5 ETH
          gas: '21000',
          gasPrice: '20000000000'
        },
        {
          hash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          blockNumber: '12345672',
          blockTimestamp: mockDatumi[6],
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI token
          value: '0',
          gas: '65000',
          gasPrice: '25000000000'
        },
        {
          hash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
          blockNumber: '12345671',
          blockTimestamp: mockDatumi[7],
          from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          value: '3000000000000000000', // 3 ETH
          gas: '21000',
          gasPrice: '20000000000'
        },
        {
          hash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
          blockNumber: '12345670',
          blockTimestamp: mockDatumi[8],
          from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          to: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK token
          value: '0',
          gas: '65000',
          gasPrice: '25000000000'
        },
        {
          hash: '0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345',
          blockNumber: '12345669',
          blockTimestamp: mockDatumi[9],
          from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
          to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          value: '4000000000000000000', // 4 ETH
          gas: '21000',
          gasPrice: '20000000000'
        }
      ];
      return mockTransakcije.slice(0, limit);
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija:', error);
    return [];
  }
}

export async function dohvatiTransakciju(hash: string): Promise<Transakcija | null> {
  try {
    const response = await moralisApi.get(`/transaction/${hash}`, {
      params: {
        chain: 'eth'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcije:', error);
    // Ako ne možemo dohvatiti transakciju, vraćamo mock podatke
    if (hash === '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef') {
      return {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        blockNumber: '12345678',
        blockTimestamp: mockDatumi[0],
        from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        value: '1000000000000000000', // 1 ETH
        gas: '21000',
        gasPrice: '20000000000'
      };
    }
    return null;
  }
}

export async function dohvatiBlokove(limit: number = 10): Promise<Blok[]> {
  try {
    // Moralis nema direktan endpoint za dohvaćanje više blokova
    // Dohvaćamo zadnje blokove
    const response = await moralisApi.get('/block/latest', {
      params: {
        chain: 'eth'
      }
    });
    
    if (response.data) {
      const zadnjiBlok = parseInt(response.data.number);
      const blokovi: Blok[] = [];
      
      // Dohvaćamo zadnjih 'limit' blokova
      for (let i = 0; i < limit; i++) {
        try {
          const blokBroj = zadnjiBlok - i;
          const blokResponse = await moralisApi.get(`/block/${blokBroj}`, {
            params: {
              chain: 'eth'
            }
          });
          
          if (blokResponse.data) {
            blokovi.push({
              number: blokResponse.data.number,
              timestamp: blokResponse.data.timestamp,
              hash: blokResponse.data.hash,
              parentHash: blokResponse.data.parent_hash || '',
              nonce: blokResponse.data.nonce || '',
              difficulty: blokResponse.data.difficulty || '',
              gasLimit: blokResponse.data.gas_limit || '',
              gasUsed: blokResponse.data.gas_used || '',
              miner: blokResponse.data.miner || '',
              transactions: blokResponse.data.transactions || []
            });
          }
        } catch (error) {
          console.error(`Greška pri dohvaćanju bloka ${zadnjiBlok - i}:`, error);
        }
      }
      
      return blokovi;
    }
    
    // Ako ne možemo dohvatiti blokove, vraćamo mock podatke
    return Array.from({ length: limit }, (_, i) => ({
      number: (12345678 - i).toString(),
      timestamp: mockDatumi[i % mockDatumi.length],
      hash: `0x${(i + 1).toString().padStart(64, '0')}`,
      parentHash: `0x${i.toString().padStart(64, '0')}`,
      nonce: '0x1234567890abcdef',
      difficulty: '123456789',
      gasLimit: '15000000',
      gasUsed: '12345678',
      miner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      transactions: [`0x${(i + 1).toString().padStart(64, 'a')}`]
    }));
  } catch (error) {
    console.error('Greška pri dohvaćanju blokova:', error);
    // Ako ne možemo dohvatiti blokove, vraćamo mock podatke
    return Array.from({ length: limit }, (_, i) => ({
      number: (12345678 - i).toString(),
      timestamp: mockDatumi[i % mockDatumi.length],
      hash: `0x${(i + 1).toString().padStart(64, '0')}`,
      parentHash: `0x${i.toString().padStart(64, '0')}`,
      nonce: '0x1234567890abcdef',
      difficulty: '123456789',
      gasLimit: '15000000',
      gasUsed: '12345678',
      miner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      transactions: [`0x${(i + 1).toString().padStart(64, 'a')}`]
    }));
  }
}

export async function dohvatiBlok(brojBloka: string): Promise<Blok | null> {
  try {
    const response = await moralisApi.get(`/block/${brojBloka}`, {
      params: {
        chain: 'eth'
      }
    });
    
    return {
      number: response.data.number,
      timestamp: response.data.timestamp,
      hash: response.data.hash,
      parentHash: response.data.parent_hash || '',
      nonce: response.data.nonce || '',
      difficulty: response.data.difficulty || '',
      gasLimit: response.data.gas_limit || '',
      gasUsed: response.data.gas_used || '',
      miner: response.data.miner || '',
      transactions: response.data.transactions || []
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju bloka:', error);
    // Ako ne možemo dohvatiti blok, vraćamo mock podatke
    const mockIndex = parseInt(brojBloka) % 10;
    return {
      number: brojBloka,
      timestamp: mockDatumi[mockIndex % mockDatumi.length],
      hash: `0x${brojBloka.padStart(64, '0')}`,
      parentHash: `0x${(parseInt(brojBloka) - 1).toString().padStart(64, '0')}`,
      nonce: '0x1234567890abcdef',
      difficulty: '123456789',
      gasLimit: '15000000',
      gasUsed: '12345678',
      miner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      transactions: [`0x${brojBloka.padStart(64, 'a')}`]
    };
  }
}

export async function dohvatiAdresu(adresa: string): Promise<Adresa | null> {
  try {
    const response = await moralisApi.get(`/${adresa}/balance`, {
      params: {
        chain: 'eth'
      }
    });
    
    // Dohvaćamo i nonce adrese
    const nonceResponse = await moralisApi.get(`/${adresa}`, {
      params: {
        chain: 'eth'
      }
    });
    
    return {
      balance: response.data.balance || '0',
      nonce: nonceResponse.data?.nonce || '0'
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju adrese:', error);
    // Ako ne možemo dohvatiti adresu, vraćamo mock podatke
    return {
      balance: '1000000000000000000', // 1 ETH
      nonce: '5'
    };
  }
}

export async function dohvatiTokene(adresa: string): Promise<Token[]> {
  try {
    const response = await moralisApi.get(`/${adresa}/erc20`, {
      params: {
        chain: 'eth'
      }
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Greška pri dohvaćanju tokena:', error);
    // Ako ne možemo dohvatiti tokene, vraćamo mock podatke
    return [
      {
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: '6',
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        balance: '1000000' // 1 USDT
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: '6',
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        balance: '2000000' // 2 USDC
      },
      {
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: '18',
        contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        balance: '3000000000000000000' // 3 DAI
      }
    ];
  }
}

export async function dohvatiCijenuEthera(): Promise<number> {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'ethereum',
        vs_currencies: 'usd'
      }
    });
    
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Greška pri dohvaćanju cijene Ethera:', error);
    // Ako ne možemo dohvatiti cijenu, vraćamo mock podatak
    return 3500; // Pretpostavljamo da je cijena Ethera 3500 USD
  }
}

interface CijenaPodatak {
  cijena: number;
  datum: string;
}

// Fiksne cijene za mock podatke
const mockCijene = [
  3520, 3480, 3510, 3490, 3530, 3550, 3540, 3500, 3520, 3560,
  3580, 3570, 3590, 3600, 3610, 3590, 3580, 3570, 3550, 3540,
  3530, 3520, 3510, 3500, 3490, 3480, 3470, 3460, 3450, 3440
];

export async function dohvatiPovijestCijenaEthera(dani: number = 7): Promise<{cijene: number[], datumi: string[]}> {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: dani
      }
    });
    
    const podaci: CijenaPodatak[] = response.data.prices.map((item: [number, number]) => {
      const datum = new Date(item[0]);
      return {
        cijena: item[1],
        datum: `${datum.getDate()}.${datum.getMonth() + 1}.`
      };
    });
    
    return {
      cijene: podaci.map((p) => p.cijena),
      datumi: podaci.map((p) => p.datum)
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju povijesti cijena Ethera:', error);
    // Ako ne možemo dohvatiti povijest cijena, vraćamo mock podatke
    const podaci: CijenaPodatak[] = Array.from({ length: dani }, (_, i) => {
      const datum = new Date('2025-04-29');
      datum.setDate(datum.getDate() - (dani - i - 1));
      return {
        cijena: mockCijene[i % mockCijene.length],
        datum: `${datum.getDate()}.${datum.getMonth() + 1}.`
      };
    });
    
    return {
      cijene: podaci.map((p) => p.cijena),
      datumi: podaci.map((p) => p.datum)
    };
  }
}
