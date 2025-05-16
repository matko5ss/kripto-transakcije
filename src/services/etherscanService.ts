import axios from 'axios';

// Etherscan API URL
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

// Tipovi podataka
export interface EthereumAddressData {
  address: string;
  balance: number;
  txCount: number;
}

export interface EthereumTransactionData {
  hash: string;
  blockNumber: number;
  timeStamp: string;
  from: string;
  to: string;
  value: number;
  gas: number;
  gasPrice: number;
  gasUsed: number;
  confirmations: number;
}

export interface EthereumBlockData {
  hash: string;
  number: number;
  timestamp: string;
  transactions: number;
  miner: string;
  gasUsed: number;
  gasLimit: number;
  baseFeePerGas: number;
  size: number;
}

/**
 * Pretvara Wei u ETH
 * @param wei Vrijednost u Wei
 * @returns Vrijednost u ETH
 */
const weiToEth = (wei: string): number => {
  return parseFloat(wei) / 1e18;
};

/**
 * Dohvaća podatke o Ethereum adresi
 * @param address Ethereum adresa
 * @returns Podaci o adresi
 */
export const getAddressData = async (address: string): Promise<EthereumAddressData | null> => {
  try {
    console.log(`Dohvaćanje podataka za Ethereum adresu: ${address}`);
    
    // Dohvaćanje stanja
    const balanceResponse = await axios.get(`${ETHERSCAN_API_URL}?module=account&action=balance&address=${address}&tag=latest`);
    
    // Dohvaćanje broja transakcija
    const txCountResponse = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest`);
    
    if (balanceResponse.data.status === '1' && txCountResponse.data.result) {
      return {
        address: address,
        balance: weiToEth(balanceResponse.data.result),
        txCount: parseInt(txCountResponse.data.result, 16)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o Ethereum adresi:', error);
    return null;
  }
};

/**
 * Dohvaća transakcije za Ethereum adresu
 * @param address Ethereum adresa
 * @param page Broj stranice (počinje od 1)
 * @param offset Broj transakcija po stranici
 * @returns Lista transakcija
 */
export const getAddressTransactions = async (
  address: string,
  page: number = 1,
  offset: number = 10
): Promise<EthereumTransactionData[]> => {
  try {
    console.log(`Dohvaćanje transakcija za Ethereum adresu: ${address}, stranica: ${page}, offset: ${offset}`);
    
    const response = await axios.get(
      `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}&sort=desc`
    );
    
    if (response.data.status === '1' && Array.isArray(response.data.result)) {
      return response.data.result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber),
        timeStamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        from: tx.from,
        to: tx.to,
        value: weiToEth(tx.value),
        gas: parseInt(tx.gas),
        gasPrice: parseInt(tx.gasPrice) / 1e9, // Pretvara u Gwei
        gasUsed: parseInt(tx.gasUsed),
        confirmations: parseInt(tx.confirmations)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Greška prilikom dohvaćanja transakcija za Ethereum adresu:', error);
    return [];
  }
};

/**
 * Dohvaća podatke o Ethereum transakciji
 * @param txHash Hash transakcije
 * @returns Podaci o transakciji
 */
export const getTransactionData = async (txHash: string): Promise<EthereumTransactionData | null> => {
  try {
    console.log(`Dohvaćanje podataka za Ethereum transakciju: ${txHash}`);
    
    const response = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`);
    const receiptResponse = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`);
    
    if (response.data.result && receiptResponse.data.result) {
      const tx = response.data.result;
      const receipt = receiptResponse.data.result;
      
      // Dohvaćanje trenutnog broja blokova za izračun potvrda
      const blockNumberResponse = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_blockNumber`);
      const currentBlock = parseInt(blockNumberResponse.data.result, 16);
      const txBlock = parseInt(tx.blockNumber, 16);
      
      return {
        hash: tx.hash,
        blockNumber: txBlock,
        timeStamp: '', // Etherscan API ne vraća timestamp u ovom pozivu
        from: tx.from,
        to: tx.to,
        value: weiToEth(tx.value),
        gas: parseInt(tx.gas, 16),
        gasPrice: parseInt(tx.gasPrice, 16) / 1e9, // Pretvara u Gwei
        gasUsed: parseInt(receipt.gasUsed, 16),
        confirmations: currentBlock - txBlock
      };
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o Ethereum transakciji:', error);
    return null;
  }
};

/**
 * Dohvaća podatke o Ethereum bloku
 * @param blockNumber Broj bloka
 * @returns Podaci o bloku
 */
export const getBlockData = async (blockNumber: number | string): Promise<EthereumBlockData | null> => {
  try {
    console.log(`Dohvaćanje podataka za Ethereum blok: ${blockNumber}`);
    
    // Ako je string, pretvori u hex
    const blockParam = typeof blockNumber === 'string' ? blockNumber : '0x' + blockNumber.toString(16);
    
    const response = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_getBlockByNumber&tag=${blockParam}&boolean=true`);
    
    if (response.data.result) {
      const block = response.data.result;
      
      return {
        hash: block.hash,
        number: parseInt(block.number, 16),
        timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString(),
        transactions: block.transactions.length,
        miner: block.miner,
        gasUsed: parseInt(block.gasUsed, 16),
        gasLimit: parseInt(block.gasLimit, 16),
        baseFeePerGas: block.baseFeePerGas ? parseInt(block.baseFeePerGas, 16) / 1e9 : 0, // Pretvara u Gwei
        size: parseInt(block.size, 16)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o Ethereum bloku:', error);
    return null;
  }
};

/**
 * Dohvaća podatke o zadnjem Ethereum bloku
 * @returns Podaci o zadnjem bloku
 */
export const getLatestBlock = async (): Promise<EthereumBlockData | null> => {
  try {
    console.log('Dohvaćanje podataka o zadnjem Ethereum bloku');
    
    const response = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_blockNumber`);
    
    if (response.data.result) {
      const blockNumber = parseInt(response.data.result, 16);
      return getBlockData(blockNumber);
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka o zadnjem Ethereum bloku:', error);
    return null;
  }
};

/**
 * Dohvaća trenutnu cijenu gasa
 * @returns Cijena gasa u Gwei
 */
export const getGasPrice = async (): Promise<number | null> => {
  try {
    console.log('Dohvaćanje trenutne cijene gasa');
    
    const response = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_gasPrice`);
    
    if (response.data.result) {
      // Pretvara Wei u Gwei
      return parseInt(response.data.result, 16) / 1e9;
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja trenutne cijene gasa:', error);
    return null;
  }
};

/**
 * Dohvaća zadnje transakcije na Ethereum mreži
 * @param limit Broj transakcija za dohvatiti
 * @returns Lista zadnjih transakcija
 */
export const getLatestTransactions = async (limit: number = 10): Promise<EthereumTransactionData[]> => {
  try {
    console.log(`Dohvaćanje zadnjih ${limit} transakcija na Ethereum mreži`);
    
    // Prvo dohvati zadnji blok
    const latestBlockResponse = await axios.get(`${ETHERSCAN_API_URL}?module=proxy&action=eth_blockNumber`);
    
    if (latestBlockResponse.data.result) {
      const blockNumber = parseInt(latestBlockResponse.data.result, 16);
      
      // Dohvati podatke o bloku
      const blockResponse = await axios.get(
        `${ETHERSCAN_API_URL}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true`
      );
      
      if (blockResponse.data.result && blockResponse.data.result.transactions) {
        const transactions = blockResponse.data.result.transactions.slice(0, limit);
        
        // Dohvati detalje za svaku transakciju
        const txPromises = transactions.map((tx: any) => getTransactionData(tx.hash));
        const txDetails = await Promise.all(txPromises);
        
        // Filtriraj null vrijednosti
        return txDetails.filter((tx): tx is EthereumTransactionData => tx !== null);
      }
    }
    
    return [];
  } catch (error) {
    console.error('Greška prilikom dohvaćanja zadnjih transakcija:', error);
    return [];
  }
};
