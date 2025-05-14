/**
 * Service za komunikaciju s Python Dune API-jem
 */

// Tipovi podataka
export interface Token {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress: string;
  logo?: string;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from_address: string;
  to: string;
  value: string;
  gasUsed: string;
}

export interface EthereumStatus {
  price: number;
  last_block: number;
  gas_price: number;
  transactions_count: number;
}

// Bazni URL za Python API
const PYTHON_API_BASE_URL = 'http://localhost:8000/api';

/**
 * Dohvaća stanja tokena za određenu adresu
 */
export async function getTokenBalances(address: string): Promise<Token[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/token-balances/${address}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju stanja tokena:', error);
    return [];
  }
}

/**
 * Dohvaća transakcije za određenu adresu
 */
export async function getTransactions(address: string): Promise<Transaction[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/transactions/${address}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija:', error);
    return [];
  }
}

/**
 * Dohvaća trenutno stanje Ethereum mreže
 */
export async function getEthereumStatus(): Promise<EthereumStatus> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/ethereum-status`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju stanja Ethereum mreže:', error);
    return {
      price: 0,
      last_block: 0,
      gas_price: 0,
      transactions_count: 0
    };
  }
}
