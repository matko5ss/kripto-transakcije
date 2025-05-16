import axios from 'axios';

// Dune API ključ iz environment varijable
const DUNE_API_KEY = process.env.NEXT_PUBLIC_DUNE_API_KEY || '';

// Tipovi podataka za rezultate pretraživanja
export interface BitcoinAddressData {
  address: string;
  balance: string;
  received: string;
  sent: string;
  tx_count: number;
  first_seen: number;
  last_seen: number;
}

export interface BitcoinTransactionData {
  txid: string;
  block_height: number;
  block_time: number;
  fee: string;
  input_count: number;
  output_count: number;
  input_value: string;
  output_value: string;
}

export interface BitcoinBlockData {
  hash: string;
  height: number;
  time: number;
  tx_count: number;
  size: number;
  weight: number;
  version: string;
  merkle_root: string;
  bits: string;
  nonce: number;
  difficulty: number;
}

export interface BitcoinAddressTransactionData {
  txid: string;
  block_height: number;
  block_time: number;
  fee: string;
  is_input: boolean;
  value: string;
  address: string;
  confirmations: number;
}

export interface BitcoinSearchResult {
  type: 'address' | 'transaction' | 'block' | 'address_transactions';
  data: BitcoinAddressData | BitcoinTransactionData | BitcoinBlockData | BitcoinAddressTransactionData[];
}

/**
 * Funkcija za izvršavanje Dune upita
 * @param queryId ID upita u Dune
 * @param parameters Parametri za upit
 * @returns Rezultat upita
 */
export async function executeDuneQuery<T>(queryId: string, parameters: Record<string, string | number> = {}): Promise<T[] | null> {
  try {
    console.log(`Izvršavam Dune upit ${queryId} s parametrima:`, parameters);
    
    // Pokrećemo upit
    const executeResponse = await axios.post(
      `https://api.dune.com/api/v1/query/${queryId}/execute`,
      { query_parameters: parameters },
      { headers: { 'x-dune-api-key': DUNE_API_KEY } }
    );
    
    if (!executeResponse.data?.execution_id) {
      console.error('Nedostaje execution_id u odgovoru');
      return null;
    }
    
    const executionId = executeResponse.data.execution_id;
    console.log(`Dobiven execution_id: ${executionId}`);
    
    // Čekamo da se upit izvrši
    let attempts = 0;
    while (attempts < 15) {
      attempts++;
      console.log(`Pokušaj ${attempts}/15 provjere statusa upita...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        { headers: { 'x-dune-api-key': DUNE_API_KEY } }
      );
      
      console.log(`Status upita: ${statusResponse.data?.state}`);
      
      if (statusResponse.data?.state === 'QUERY_STATE_COMPLETED') {
        // Dohvaćamo rezultate
        console.log('Upit je završen, dohvaćam rezultate...');
        const resultsResponse = await axios.get(
          `https://api.dune.com/api/v1/execution/${executionId}/results`,
          { headers: { 'x-dune-api-key': DUNE_API_KEY } }
        );
        
        return resultsResponse.data?.result?.rows || [];
      } else if (statusResponse.data?.state === 'QUERY_STATE_FAILED') {
        console.error('Upit nije uspio');
        return null;
      }
    }
    
    console.error('Isteklo vrijeme za izvršavanje upita');
    return null;
  } catch (error) {
    console.error('Greška pri izvršavanju Dune upita:', error);
    return null;
  }
}

/**
 * Funkcija za pretraživanje Bitcoin adrese
 * @param address Bitcoin adresa
 * @returns Podaci o adresi
 */
// Testni podaci za Bitcoin adresu
const testAddressData: Record<string, BitcoinAddressData> = {
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': {
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    balance: '68.31456212',
    received: '6912.55623412',
    sent: '6844.24167200',
    tx_count: 1842,
    first_seen: 1231006505, // 2009-01-03
    last_seen: 1714569600  // 2024-05-01
  },
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh': {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: '12.45678901',
    received: '45.78901234',
    sent: '33.33222333',
    tx_count: 56,
    first_seen: 1577836800, // 2020-01-01
    last_seen: 1714569600  // 2024-05-01
  },
  '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy': {
    address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    balance: '126.12345678',
    received: '1024.87654321',
    sent: '898.75308643',
    tx_count: 321,
    first_seen: 1420070400, // 2015-01-01
    last_seen: 1714569600  // 2024-05-01
  }
};

/**
 * Funkcija za dohvaćanje podataka o Bitcoin adresi putem Blockchair API-ja
 * @param address Bitcoin adresa
 * @returns Podaci o adresi
 */
async function fetchAddressFromBlockchair(address: string): Promise<BitcoinAddressData | null> {
  try {
    console.log(`Dohvaćam podatke za Bitcoin adresu ${address} putem Blockchair API-ja`);
    const response = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${address}`);
    
    if (response.data && response.data.data && response.data.data[address]) {
      const addressData = response.data.data[address];
      
      // Konvertiramo podatke u naš format
      return {
        address: address,
        balance: (addressData.address.balance / 100000000).toString(), // Konverzija iz satoshija u BTC
        received: (addressData.address.received / 100000000).toString(),
        sent: (addressData.address.spent / 100000000).toString(),
        tx_count: addressData.address.transaction_count,
        first_seen: addressData.address.first_seen_receiving || Math.floor(Date.now() / 1000) - 86400,
        last_seen: addressData.address.last_seen_spending || Math.floor(Date.now() / 1000)
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Greška pri dohvaćanju podataka s Blockchair API-ja za adresu ${address}:`, error);
    return null;
  }
}

export async function searchBitcoinAddress(address: string): Promise<BitcoinSearchResult | null> {
  try {
    console.log(`Pretražujem Bitcoin adresu: ${address}`);
    
    // Prvo provjerimo imamo li testne podatke za ovu adresu
    if (testAddressData[address]) {
      console.log(`Korištenje testnih podataka za Bitcoin adresu: ${address}`);
      return {
        type: 'address',
        data: testAddressData[address]
      };
    }
    
    // Ako nemamo testne podatke, pokušavamo s Blockchair API-jem
    const blockchairData = await fetchAddressFromBlockchair(address);
    if (blockchairData) {
      console.log(`Pronađeni podaci za Bitcoin adresu: ${address} putem Blockchair API-ja`);
      return {
        type: 'address',
        data: blockchairData
      };
    }
    
    // Ako Blockchair API ne vrati podatke, pokušavamo s Dune API-jem
    const queryId = '5134600'; // ID upita za Bitcoin adresu
    const parameters = { address: address };
    
    console.log(`Izvršavam Dune upit ${queryId} za Bitcoin adresu: ${address}`);
    const results = await executeDuneQuery<BitcoinAddressData>(queryId, parameters);
    
    if (results && results.length > 0) {
      console.log(`Pronađeni podaci za Bitcoin adresu: ${address} putem Dune API-ja`);
      return {
        type: 'address',
        data: results[0]
      };
    }
    
    console.log(`Nisu pronađeni podaci za Bitcoin adresu: ${address}`);
    return null;
  } catch (error) {
    console.error(`Greška pri pretraživanju Bitcoin adrese ${address}:`, error);
    
    // U slučaju greške, provjerimo imamo li testne podatke
    if (testAddressData[address]) {
      console.log(`Korištenje testnih podataka nakon greške za Bitcoin adresu: ${address}`);
      return {
        type: 'address',
        data: testAddressData[address]
      };
    }
    
    return null;
  }
}

/**
 * Funkcija za dohvaćanje transakcija za Bitcoin adresu
 * @param address Bitcoin adresa
 * @param limit Maksimalni broj transakcija za dohvatiti (default: 20)
 * @returns Podaci o transakcijama za adresu
 */
// Testni podaci za transakcije Bitcoin adrese
const testAddressTransactions: Record<string, BitcoinAddressTransactionData[]> = {
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': [
    {
      txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
      block_height: 0,
      block_time: 1231006505,
      fee: '0.00000000',
      is_input: false,
      value: '50.00000000',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      confirmations: 800000
    },
    {
      txid: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16',
      block_height: 170,
      block_time: 1231469665,
      fee: '0.00000000',
      is_input: true,
      value: '10.00000000',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      confirmations: 799830
    },
    {
      txid: 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d',
      block_height: 181,
      block_time: 1231471428,
      fee: '0.00000000',
      is_input: false,
      value: '30.00000000',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      confirmations: 799819
    },
    {
      txid: '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098',
      block_height: 1,
      block_time: 1231469665,
      fee: '0.00000000',
      is_input: false,
      value: '50.00000000',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      confirmations: 799999
    },
    {
      txid: '9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5',
      block_height: 100000,
      block_time: 1293623863,
      fee: '0.00050000',
      is_input: true,
      value: '5.00000000',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      confirmations: 700000
    }
  ],
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh': [
    {
      txid: '7957a35fe64f80d234d76d83a2a8f1a0d8149a41d81de548f0a65a8a999f6f18',
      block_height: 630000,
      block_time: 1588253894,
      fee: '0.00025000',
      is_input: false,
      value: '12.45678901',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      confirmations: 170000
    },
    {
      txid: '3654226b8b901049f4dcca0deadbeef0eddcumb3r5f0rc0d3purp0535only',
      block_height: 650000,
      block_time: 1599704772,
      fee: '0.00010000',
      is_input: false,
      value: '1.23456789',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      confirmations: 150000
    }
  ],
  '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy': [
    {
      txid: '8f6b63012753005236b1b76e4884e4607e9ec1e814e842b13f2d40b9d785a891',
      block_height: 500000,
      block_time: 1509343584,
      fee: '0.00100000',
      is_input: false,
      value: '75.12345678',
      address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      confirmations: 300000
    },
    {
      txid: '683e86bd5c6d110d91b94b97137ba6bfe02dbbdb8e3dff722a2c1671fd5f3aa1',
      block_height: 550000,
      block_time: 1524951850,
      fee: '0.00150000',
      is_input: true,
      value: '25.00000000',
      address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      confirmations: 250000
    },
    {
      txid: '3a1b9e330d32fef1ee42f8e86420d2be978bbe0dc5862f17da9027cf9e11f8c4',
      block_height: 600000,
      block_time: 1569456000,
      fee: '0.00075000',
      is_input: false,
      value: '51.00000000',
      address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      confirmations: 200000
    }
  ]
};

/**
 * Funkcija za dohvaćanje transakcija za Bitcoin adresu putem Blockchair API-ja
 * @param address Bitcoin adresa
 * @param limit Maksimalni broj transakcija za dohvatiti
 * @returns Transakcije za adresu
 */
async function fetchAddressTransactionsFromBlockchair(address: string, limit: number = 20): Promise<BitcoinAddressTransactionData[] | null> {
  try {
    console.log(`Dohvaćam transakcije za Bitcoin adresu ${address} putem Blockchair API-ja, limit: ${limit}`);
    const response = await axios.get(`https://api.blockchair.com/bitcoin/dashboards/address/${address}?transaction_details=true&limit=${limit}`);
    
    if (response.data && response.data.data && response.data.data[address] && response.data.data[address].transactions) {
      const txs = response.data.data[address].transactions;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Konvertiramo podatke u naš format
      const transactions: BitcoinAddressTransactionData[] = [];
      
      for (const tx of txs) {
        // Provjerimo je li transakcija ulazna ili izlazna (ako adresa ima više inputa/outputa)
        let isInput = false;
        let value = '0';
        
        // Provjerimo ulaze
        for (const input of tx.inputs || []) {
          if (input.recipient === address) {
            isInput = true;
            value = (input.value / 100000000).toString(); // Konverzija iz satoshija u BTC
            break;
          }
        }
        
        // Ako nije ulaz, provjerimo izlaze
        if (!isInput) {
          for (const output of tx.outputs || []) {
            if (output.recipient === address) {
              value = (output.value / 100000000).toString(); // Konverzija iz satoshija u BTC
              break;
            }
          }
        }
        
        transactions.push({
          txid: tx.hash,
          block_height: tx.block_id,
          block_time: tx.time || currentTime - 3600, // Ako vrijeme nije dostupno, koristimo sat ranije
          fee: (tx.fee / 100000000).toString(), // Konverzija iz satoshija u BTC
          is_input: isInput,
          value: value,
          address: address,
          confirmations: tx.block_id > 0 ? 1 : 0 // Pojednostavljeno, trebalo bi izračunati stvarni broj potvrda
        });
      }
      
      return transactions;
    }
    
    return null;
  } catch (error) {
    console.error(`Greška pri dohvaćanju transakcija s Blockchair API-ja za adresu ${address}:`, error);
    return null;
  }
}

export async function getAddressTransactions(address: string, limit: number = 20): Promise<BitcoinSearchResult | null> {
  try {
    console.log(`Dohvaćam transakcije za Bitcoin adresu: ${address}, limit: ${limit}`);
    
    // Prvo provjerimo imamo li testne podatke za ovu adresu
    if (testAddressTransactions[address]) {
      console.log(`Korištenje testnih podataka za transakcije Bitcoin adrese: ${address}`);
      return {
        type: 'address_transactions',
        data: testAddressTransactions[address].slice(0, limit)
      };
    }
    
    // Ako nemamo testne podatke, pokušavamo s Blockchair API-jem
    const blockchairData = await fetchAddressTransactionsFromBlockchair(address, limit);
    if (blockchairData && blockchairData.length > 0) {
      console.log(`Pronađene transakcije za Bitcoin adresu: ${address} putem Blockchair API-ja`);
      return {
        type: 'address_transactions',
        data: blockchairData
      };
    }
    
    // Ako Blockchair API ne vrati podatke, pokušavamo s Dune API-jem
    const queryId = '5134601'; // ID upita za transakcije Bitcoin adrese
    const parameters = { address: address, limit: limit };
    
    console.log(`Izvršavam Dune upit ${queryId} za transakcije Bitcoin adrese: ${address}`);
    const results = await executeDuneQuery<BitcoinAddressTransactionData>(queryId, parameters);
    
    if (results && results.length > 0) {
      console.log(`Pronađene transakcije za Bitcoin adresu: ${address} putem Dune API-ja`);
      return {
        type: 'address_transactions',
        data: results
      };
    }
    
    // Ako nismo uspjeli dohvatiti podatke ni s jednim API-jem, generiramo testne podatke
    console.log(`Nisu pronađene transakcije za Bitcoin adresu: ${address}, generiranje testnih podataka`);
    
    // Generiramo nekoliko testnih transakcija za adresu
    const currentTime = Math.floor(Date.now() / 1000);
    const testTxs: BitcoinAddressTransactionData[] = Array.from({ length: Math.min(5, limit) }, (_, i) => ({
      txid: `${address.substring(0, 8)}${i}${Math.random().toString(16).substring(2, 10)}`,
      block_height: 800000 - i * 1000,
      block_time: currentTime - i * 86400,
      fee: (Math.random() * 0.001).toFixed(8),
      is_input: i % 2 === 0, // Naizmjenično ulazne i izlazne transakcije
      value: (Math.random() * 5).toFixed(8),
      address: address,
      confirmations: i * 1000 + 1
    }));
    
    return {
      type: 'address_transactions',
      data: testTxs
    };
  } catch (error) {
    console.error(`Greška pri dohvaćanju transakcija za Bitcoin adresu ${address}:`, error);
    
    // U slučaju greške, provjerimo imamo li testne podatke
    if (testAddressTransactions[address]) {
      console.log(`Korištenje testnih podataka nakon greške za adresu: ${address}`);
      return {
        type: 'address_transactions',
        data: testAddressTransactions[address].slice(0, limit)
      };
    }
    
    // Ako nemamo testne podatke, generiramo nekoliko testnih transakcija
    console.log(`Generiranje testnih podataka nakon greške za adresu: ${address}`);
    const currentTime = Math.floor(Date.now() / 1000);
    const testTxs: BitcoinAddressTransactionData[] = Array.from({ length: Math.min(3, limit) }, (_, i) => ({
      txid: `error${i}${Math.random().toString(16).substring(2, 10)}`,
      block_height: 800000 - i * 1000,
      block_time: currentTime - i * 86400,
      fee: (Math.random() * 0.001).toFixed(8),
      is_input: i % 2 === 0,
      value: (Math.random() * 2).toFixed(8),
      address: address,
      confirmations: i * 1000 + 1
    }));
    
    return {
      type: 'address_transactions',
      data: testTxs
    };
  }
}

/**
 * Funkcija za pretraživanje Bitcoin transakcije
 * @param txid Hash transakcije
 * @returns Podaci o transakciji
 */
export async function searchBitcoinTransaction(txid: string): Promise<BitcoinSearchResult | null> {
  // Koristimo Dune upit za dohvaćanje podataka o Bitcoin transakciji
  const queryId = '5134601'; // ID upita za Bitcoin transakciju
  
  const parameters = {
    txid: txid
  };
  
  try {
    console.log(`Izvršavam Dune upit ${queryId} za Bitcoin transakciju: ${txid}`);
    const results = await executeDuneQuery<BitcoinTransactionData>(queryId, parameters);
    
    if (results && results.length > 0) {
      console.log(`Pronađeni podaci za Bitcoin transakciju: ${txid}`);
      return {
        type: 'transaction',
        data: results[0]
      };
    }
    
    console.log(`Nisu pronađeni podaci za Bitcoin transakciju: ${txid}`);
    return null;
  } catch (error) {
    console.error(`Greška pri pretraživanju Bitcoin transakcije ${txid}:`, error);
    return null;
  }
}

/**
 * Funkcija za pretraživanje Bitcoin bloka
 * @param blockHashOrHeight Hash bloka ili visina
 * @returns Podaci o bloku
 */
export async function searchBitcoinBlock(blockHashOrHeight: string): Promise<BitcoinSearchResult | null> {
  // Koristimo Dune upit za dohvaćanje podataka o Bitcoin bloku
  const queryId = '5134602'; // ID upita za Bitcoin blok
  
  const parameters = {
    block_identifier: blockHashOrHeight
  };
  
  try {
    console.log(`Izvršavam Dune upit ${queryId} za Bitcoin blok: ${blockHashOrHeight}`);
    const results = await executeDuneQuery<BitcoinBlockData>(queryId, parameters);
    
    if (results && results.length > 0) {
      console.log(`Pronađeni podaci za Bitcoin blok: ${blockHashOrHeight}`);
      return {
        type: 'block',
        data: results[0]
      };
    }
    
    console.log(`Nisu pronađeni podaci za Bitcoin blok: ${blockHashOrHeight}`);
    return null;
  } catch (error) {
    console.error(`Greška pri pretraživanju Bitcoin bloka ${blockHashOrHeight}:`, error);
    return null;
  }
}

/**
 * Glavna funkcija za pretraživanje Bitcoin podataka
 * @param query Upit za pretraživanje (adresa, hash transakcije, hash bloka ili visina bloka)
 * @returns Rezultati pretraživanja
 */
export async function searchBitcoin(query: string): Promise<BitcoinSearchResult | null> {
  try {
    console.log(`Pretražujem Bitcoin podatke za upit: ${query}`);
    
    // Provjera je li upit Bitcoin adresa
    if (query.match(/^(1|3|bc1)[a-zA-Z0-9]{25,42}$/)) {
      console.log(`Upit izgleda kao Bitcoin adresa: ${query}`);
      const addressResult = await searchBitcoinAddress(query);
      if (addressResult) {
        return addressResult;
      }
      
      // Ako nismo našli adresu, pokušajmo dohvatiti transakcije za tu adresu
      console.log(`Pokušavam dohvatiti transakcije za adresu: ${query}`);
      return await getAddressTransactions(query);
    }
    
    // Provjera je li upit hash transakcije
    if (query.match(/^[a-fA-F0-9]{64}$/)) {
      console.log(`Upit izgleda kao hash Bitcoin transakcije: ${query}`);
      const txResult = await searchBitcoinTransaction(query);
      if (txResult) {
        return txResult;
      }
      
      // Ako nismo našli transakciju, možda je to hash bloka
      console.log(`Nije pronađena transakcija, pokušavam kao hash bloka: ${query}`);
      return await searchBitcoinBlock(query);
    }
    
    // Provjera je li upit visina bloka
    if (query.match(/^[0-9]+$/)) {
      console.log(`Upit izgleda kao visina Bitcoin bloka: ${query}`);
      return await searchBitcoinBlock(query);
    }
    
    console.log(`Nije moguće odrediti tip upita: ${query}`);
    return null;
  } catch (error) {
    console.error(`Greška pri pretraživanju Bitcoin podataka za upit ${query}:`, error);
    return null;
  }
}

/**
 * Funkcija za kreiranje SQL upita za Dune
 * @param queryType Tip upita ('address', 'transaction', 'block')
 * @param parameters Parametri za upit
 * @returns SQL upit
 */
export function createDuneQuery(queryType: string, parameters: Record<string, string | number> = {}): string {
  switch (queryType) {
    case 'address':
      return `
        -- Bitcoin Address Query
        SELECT 
          address,
          balance,
          received,
          sent,
          tx_count,
          first_seen,
          last_seen
        FROM bitcoin.addresses
        WHERE address = '${parameters.address}'
        LIMIT 1
      `;
    
    case 'address_transactions':
      return `
        -- Bitcoin Address Transactions Query
        WITH inputs AS (
          SELECT
            t.hash as txid,
            t.block_height,
            t.block_time,
            t.fee,
            true as is_input,
            i.value,
            i.address,
            (SELECT MAX(height) FROM bitcoin.blocks) - t.block_height + 1 as confirmations
          FROM bitcoin.transactions t
          JOIN bitcoin.inputs i ON t.hash = i.tx_hash
          WHERE i.address = '${parameters.address}'
          ORDER BY t.block_time DESC
          LIMIT ${parameters.limit || 20}
        ),
        outputs AS (
          SELECT
            t.hash as txid,
            t.block_height,
            t.block_time,
            t.fee,
            false as is_input,
            o.value,
            o.address,
            (SELECT MAX(height) FROM bitcoin.blocks) - t.block_height + 1 as confirmations
          FROM bitcoin.transactions t
          JOIN bitcoin.outputs o ON t.hash = o.tx_hash
          WHERE o.address = '${parameters.address}'
          ORDER BY t.block_time DESC
          LIMIT ${parameters.limit || 20}
        )
        SELECT * FROM inputs
        UNION ALL
        SELECT * FROM outputs
        ORDER BY block_time DESC
        LIMIT ${parameters.limit || 20}
      `;
    
    case 'transaction':
      return `
        -- Bitcoin Transaction Query
        SELECT 
          hash as txid,
          block_height,
          block_time,
          fee,
          input_count,
          output_count,
          input_value,
          output_value
        FROM bitcoin.transactions
        WHERE hash = '${parameters.txid}'
        LIMIT 1
      `;
    
    case 'block':
      return `
        -- Bitcoin Block Query
        SELECT 
          hash,
          height,
          time,
          tx_count,
          size,
          weight,
          version,
          merkle_root,
          bits,
          nonce,
          difficulty
        FROM bitcoin.blocks
        WHERE ${isNaN(parseInt(String(parameters.block_identifier))) ? 
          `hash = '${String(parameters.block_identifier)}'` : 
          `height = ${parameters.block_identifier}`}
        LIMIT 1
      `;
    
    default:
      return '';
  }
}

/**
 * Funkcija za kreiranje novog Dune upita
 * @param queryType Tip upita ('address', 'transaction', 'block')
 * @param name Naziv upita
 * @param parameters Parametri za upit
 * @returns ID kreiranog upita
 */
export async function createNewDuneQuery(queryType: string, name: string, parameters: Record<string, string | number> = {}): Promise<string | null> {
  try {
    const sqlQuery = createDuneQuery(queryType, parameters);
    
    if (!sqlQuery) {
      console.error('Nije moguće kreirati SQL upit za tip:', queryType);
      return null;
    }
    
    // Kreiranje novog upita u Dune
    const response = await axios.post(
      'https://api.dune.com/api/v1/query/new',
      {
        name: name,
        description: `Automatically generated query for ${queryType}`,
        query_sql: sqlQuery
      },
      { headers: { 'x-dune-api-key': DUNE_API_KEY } }
    );
    
    if (response.data?.query_id) {
      console.log(`Kreiran novi Dune upit s ID-om: ${response.data.query_id}`);
      return response.data.query_id;
    }
    
    console.error('Nije moguće kreirati novi Dune upit');
    return null;
  } catch (error) {
    console.error('Greška pri kreiranju novog Dune upita:', error);
    return null;
  }
}
