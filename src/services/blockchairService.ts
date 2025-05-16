import axios from 'axios';

// Tipovi podataka za rezultate pretraživanja
export interface BitcoinAddressData {
  address: string;
  balance: number;
  received: number;
  spent: number;
  tx_count: number;
  first_seen: string;
  last_seen: string;
}

export interface BitcoinTransactionData {
  txid: string;
  block_height: number;
  block_time: string;
  fee: number;
  is_input: boolean;
  value: number;
  address: string;
  confirmations: number;
}

export interface BitcoinTransactionDetailData {
  txid: string;
  block_height: number;
  block_time: string;
  fee: number;
  input_count: number;
  output_count: number;
  input_value: number;
  output_value: number;
}

export interface BitcoinBlockData {
  hash: string;
  height: number;
  time: string;
  tx_count: number;
  size: number;
  weight: number;
  version: number;
  merkle_root: string;
  bits: number;
  nonce: number;
  difficulty: number;
}

// Blockchair API URL
const BLOCKCHAIR_API_URL = 'https://api.blockchair.com/bitcoin';

/**
 * Pretvara satoshi u BTC
 * @param satoshi Vrijednost u satoshima
 * @returns Vrijednost u BTC
 */
const satoshiToBTC = (satoshi: number): number => {
  return satoshi / 100000000;
};

/**
 * Dohvaća podatke o Bitcoin adresi
 * @param address Bitcoin adresa
 * @returns Podaci o adresi
 */
export const searchBitcoinAddress = async (address: string): Promise<BitcoinAddressData | null> => {
  try {
    console.log(`Dohvaćanje podataka za Bitcoin adresu: ${address}`);
    
    const response = await axios.get(`${BLOCKCHAIR_API_URL}/dashboards/address/${address}`);
    
    if (response.data && response.data.data && response.data.data[address]) {
      const addressData = response.data.data[address].address;
      
      return {
        address: address,
        balance: satoshiToBTC(addressData.balance),
        received: satoshiToBTC(addressData.received),
        spent: satoshiToBTC(addressData.spent),
        tx_count: addressData.transaction_count,
        first_seen: new Date(addressData.first_seen_at).toISOString(),
        last_seen: new Date(addressData.last_seen_at).toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o Bitcoin adresi:', error);
    return null;
  }
};

/**
 * Dohvaća transakcije za Bitcoin adresu
 * @param address Bitcoin adresa
 * @param limit Maksimalni broj transakcija
 * @returns Lista transakcija
 */
export const getAddressTransactions = async (address: string, limit: number = 100): Promise<BitcoinTransactionData[]> => {
  try {
    console.log(`Dohvaćanje transakcija za Bitcoin adresu: ${address}, limit: ${limit}`);
    
    const response = await axios.get(`${BLOCKCHAIR_API_URL}/dashboards/address/${address}?transaction_details=true&limit=${limit}`);
    
    if (response.data && response.data.data && response.data.data[address]) {
      const transactions = response.data.data[address].transactions;
      const currentHeight = response.data.context.state;
      
      return transactions.map((tx: any) => {
        // Određivanje je li ovo ulazna ili izlazna transakcija
        const isInput = tx.balance_change < 0;
        
        return {
          txid: tx.hash,
          block_height: tx.block_id,
          block_time: new Date(tx.time).toISOString(),
          fee: satoshiToBTC(tx.fee || 0),
          is_input: isInput,
          value: satoshiToBTC(Math.abs(tx.balance_change)),
          address: address,
          confirmations: tx.block_id > 0 ? currentHeight - tx.block_id + 1 : 0
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Greška prilikom dohvaćanja transakcija za Bitcoin adresu:', error);
    return [];
  }
};

/**
 * Dohvaća detalje o Bitcoin transakciji
 * @param txid ID transakcije
 * @returns Detalji o transakciji
 */
export const searchBitcoinTransaction = async (txid: string): Promise<BitcoinTransactionDetailData | null> => {
  try {
    console.log(`Dohvaćanje podataka za Bitcoin transakciju: ${txid}`);
    
    const response = await axios.get(`${BLOCKCHAIR_API_URL}/dashboards/transaction/${txid}`);
    
    if (response.data && response.data.data && response.data.data[txid]) {
      const txData = response.data.data[txid].transaction;
      
      return {
        txid: txid,
        block_height: txData.block_id,
        block_time: new Date(txData.time).toISOString(),
        fee: satoshiToBTC(txData.fee),
        input_count: txData.input_count,
        output_count: txData.output_count,
        input_value: satoshiToBTC(txData.input_total),
        output_value: satoshiToBTC(txData.output_total)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o Bitcoin transakciji:', error);
    return null;
  }
};

/**
 * Dohvaća podatke o Bitcoin bloku
 * @param blockIdentifier Hash ili visina bloka
 * @returns Podaci o bloku
 */
export const searchBitcoinBlock = async (blockIdentifier: string): Promise<BitcoinBlockData | null> => {
  try {
    console.log(`Dohvaćanje podataka za Bitcoin blok: ${blockIdentifier}`);
    
    // Određivanje je li identifikator hash ili visina
    const isHash = blockIdentifier.length > 10;
    const endpoint = isHash ? 'block' : 'block-height';
    
    const response = await axios.get(`${BLOCKCHAIR_API_URL}/dashboards/${endpoint}/${blockIdentifier}`);
    
    if (response.data && response.data.data) {
      // Ako je pretraga po visini, dohvati hash
      const blockHash = isHash ? blockIdentifier : Object.keys(response.data.data)[0];
      
      if (!blockHash) {
        return null;
      }
      
      const blockData = response.data.data[blockHash].block;
      
      return {
        hash: blockData.hash,
        height: blockData.id,
        time: new Date(blockData.time).toISOString(),
        tx_count: blockData.transaction_count,
        size: blockData.size,
        weight: blockData.weight || 0,
        version: blockData.version,
        merkle_root: blockData.merkle_root,
        bits: parseInt(blockData.bits),
        nonce: blockData.nonce,
        difficulty: blockData.difficulty
      };
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o Bitcoin bloku:', error);
    return null;
  }
};

/**
 * Dohvaća trenutnu cijenu Bitcoina
 * @returns Cijena u USD
 */
export const getBitcoinPrice = async (): Promise<number | null> => {
  try {
    console.log('Dohvaćanje trenutne cijene Bitcoina putem CoinGecko API-ja');
    
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    
    if (response.data && response.data.bitcoin && response.data.bitcoin.usd) {
      return response.data.bitcoin.usd;
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja cijene Bitcoina:', error);
    return null;
  }
};

/**
 * Dohvaća prosječnu naknadu za Bitcoin transakcije
 * @returns Prosječna naknada u satoshima po bajtu
 */
export const getBitcoinAverageFee = async (): Promise<number | null> => {
  try {
    console.log('Dohvaćanje prosječne naknade za Bitcoin transakcije');
    
    const response = await axios.get(`${BLOCKCHAIR_API_URL}/stats`);
    
    if (response.data && response.data.data) {
      // Blockchair vraća naknadu u satoshima po bajtu
      return response.data.data.suggested_transaction_fee_per_byte_sat;
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja prosječne naknade za Bitcoin transakcije:', error);
    return null;
  }
};

/**
 * Dohvaća podatke o zadnjem Bitcoin bloku
 * @returns Podaci o zadnjem bloku
 */
export const getLatestBitcoinBlock = async (): Promise<BitcoinBlockData | null> => {
  try {
    console.log('Dohvaćanje podataka o zadnjem Bitcoin bloku');
    
    const response = await axios.get(`${BLOCKCHAIR_API_URL}/stats`);
    
    if (response.data && response.data.data) {
      const latestHeight = response.data.data.blocks;
      return searchBitcoinBlock(latestHeight.toString());
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o zadnjem Bitcoin bloku:', error);
    return null;
  }
};
