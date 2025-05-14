/**
 * Service za komunikaciju s Python Bitcoin API-jem
 */

// Tipovi podataka
export interface BitcoinTransaction {
  txid: string;
  block_height: number;
  timestamp: number;
  sender: string;
  recipient: string;
  value: string;
  fee: string;
  confirmations: number;
}

export interface BitcoinBlock {
  height: number;
  hash: string;
  timestamp: number;
  size: number;
  tx_count: number;
  miner: string;
  difficulty: string;
  weight: number;
  version: string;
  merkle_root: string;
  bits: string;
  nonce: number;
  previous_block_hash?: string;
}

export interface BitcoinAddressInfo {
  address: string;
  balance: string;
  tx_count: number;
  total_received: string;
  total_sent: string;
  first_seen: number;
  last_seen: number;
}

export interface BitcoinStatus {
  price: number;
  last_block: number;
  fee_rate: number;
  transactions_count: number;
  difficulty: number;
  hashrate: number;
}

export interface BitcoinPriceHistory {
  date: string;
  price: number;
}

// Bazni URL za Python API
const PYTHON_API_BASE_URL = 'http://localhost:8000/api/bitcoin';

/**
 * Dohvaća trenutno stanje Bitcoin mreže
 */
export async function getBitcoinStatus(): Promise<BitcoinStatus> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/status`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju stanja Bitcoin mreže:', error);
    return {
      price: 0,
      last_block: 0,
      fee_rate: 0,
      transactions_count: 0,
      difficulty: 0,
      hashrate: 0
    };
  }
}

/**
 * Dohvaća zadnje Bitcoin transakcije
 */
export async function getBitcoinTransactions(limit: number = 10): Promise<BitcoinTransaction[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/transactions?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin transakcija:', error);
    return [];
  }
}

/**
 * Dohvaća Bitcoin transakcije za određenu adresu
 */
export async function getBitcoinAddressTransactions(address: string, limit: number = 10): Promise<BitcoinTransaction[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/transactions/${address}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin transakcija za adresu:', error);
    return [];
  }
}

/**
 * Dohvaća zadnje Bitcoin blokove
 */
export async function getBitcoinBlocks(limit: number = 5): Promise<BitcoinBlock[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/blocks?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin blokova:', error);
    return [];
  }
}

/**
 * Dohvaća informacije o Bitcoin adresi
 */
export async function getBitcoinAddressInfo(address: string): Promise<BitcoinAddressInfo | null> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/address/${address}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju informacija o Bitcoin adresi:', error);
    return null;
  }
}

/**
 * Dohvaća povijest cijene Bitcoina
 */
export async function getBitcoinPriceHistory(days: number = 7): Promise<BitcoinPriceHistory[]> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/price-history?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju povijesti cijene Bitcoina:', error);
    return [];
  }
}

/**
 * Dohvaća detalje Bitcoin transakcije prema hash-u
 */
export async function getBitcoinTransaction(txid: string): Promise<BitcoinTransaction | null> {
  try {
    const response = await fetch(`${PYTHON_API_BASE_URL}/transaction/${txid}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.error('Bitcoin transakcija nije pronađena');
        return null;
      }
      throw new Error(`HTTP greška: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Greška pri dohvaćanju detalja Bitcoin transakcije:', error);
    return null;
  }
}
