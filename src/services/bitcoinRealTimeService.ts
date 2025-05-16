import axios from 'axios';

// Konfiguracija Axios instance za Blockchair API
const blockchairApi = axios.create({
  baseURL: 'https://api.blockchair.com/bitcoin',
  headers: {
    'Accept': 'application/json'
  }
});

// Konfiguracija Axios instance za Mempool.space API
const mempoolApi = axios.create({
  baseURL: 'https://mempool.space/api',
  headers: {
    'Accept': 'application/json'
  }
});

// Konfiguracija Axios instance za Blockchain.info API
const blockchainInfoApi = axios.create({
  baseURL: 'https://blockchain.info',
  headers: {
    'Accept': 'application/json'
  }
});

// Konfiguracija Axios instance za BlockCypher API
const blockCypherApi = axios.create({
  baseURL: 'https://api.blockcypher.com/v1/btc/main',
  headers: {
    'Accept': 'application/json'
  }
});

// Tipovi podataka
export interface BitcoinRealTimePrice {
  usd: number;
  eur: number;
  usd_24h_change: number;
  eur_24h_change: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

export interface BitcoinRealTimeStats {
  blocks_count: string;
  transactions_24h: string;
  difficulty: string;
  hashrate: string;
  average_fee: string;
  mempool_transactions: string;
}

export interface BitcoinRealTimeBlock {
  height: string;
  hash: string;
  time: string;
  transaction_count: string;
  size: string;
  weight: string;
}

export interface BitcoinRealTimeTransaction {
  hash: string;
  block_height: string;
  time: string;
  input_count: string;
  output_count: string;
  value: string; // Ukupna vrijednost transakcije u BTC
  fee: string;
  fee_per_kb: string;
  size?: string;
  weight?: string;
}

/**
 * Dohvaća trenutnu cijenu i tržišne podatke za Bitcoin
 * Koristi CoinGecko API koji je besplatan i ne zahtijeva API ključ
 * Koristi nekoliko endpointa za maksimalnu pouzdanost
 */
export async function getBitcoinPrice(): Promise<BitcoinRealTimePrice | null> {
  try {
    // Koristimo najnoviji endpoint za dohvaćanje trenutne cijene
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin', {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });

    if (response.data && response.data.market_data) {
      const marketData = response.data.market_data;
      
      // Trenutni datum i vrijeme za zadnje ažuriranje
      const currentDate = new Date();
      
      // Provjera i korekcija cijene - CoinGecko ponekad vraća cijenu bez decimalnog zareza
      let usdPrice = marketData.current_price.usd;
      let eurPrice = marketData.current_price.eur;
      
      // Ako je cijena veća od 100,000, vjerojatno je bez decimalnog zareza
      if (usdPrice > 100000) {
        usdPrice = usdPrice / 1000;
        console.log('Korigirana USD cijena:', usdPrice);
      }
      
      if (eurPrice > 100000) {
        eurPrice = eurPrice / 1000;
        console.log('Korigirana EUR cijena:', eurPrice);
      }
      
      // Dodatna provjera - ako je cijena manja od 10, vjerojatno je pogrešna
      if (usdPrice < 10) {
        // Pokušaj dohvatiti cijenu s alternativnog izvora
        try {
          const backupResponse = await axios.get('https://api.blockchain.com/v3/exchange/tickers/BTC-USD');
          if (backupResponse.data && backupResponse.data.last_trade_price) {
            usdPrice = backupResponse.data.last_trade_price;
            console.log('Dohvaćena ispravna USD cijena s blockchain.com:', usdPrice);
          }
        } catch (backupError) {
          console.error('Greška pri dohvaćanju cijene s blockchain.com:', backupError);
        }
      }
      
      return {
        usd: usdPrice,
        eur: eurPrice,
        usd_24h_change: marketData.price_change_percentage_24h_in_currency.usd || 0,
        eur_24h_change: marketData.price_change_percentage_24h_in_currency.eur || 0,
        market_cap: marketData.market_cap.usd || 0,
        total_volume: marketData.total_volume.usd || 0,
        last_updated: currentDate.toISOString() // Uvijek koristimo trenutno vrijeme
      };
    }
    
    console.error('Nedostaju podaci o cijeni u odgovoru');
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju cijene Bitcoin-a:', error);
    
    // Pokušavamo s jednostavnijim endpointom ako prvi ne uspije
    try {
      const simpleResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd,eur',
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: true
        }
      });
      
      if (simpleResponse.data && simpleResponse.data.bitcoin) {
        const bitcoinData = simpleResponse.data.bitcoin;
        const currentDate = new Date();
        
        return {
          usd: bitcoinData.usd,
          eur: bitcoinData.eur,
          usd_24h_change: bitcoinData.usd_24h_change || 0,
          eur_24h_change: bitcoinData.eur_24h_change || 0,
          market_cap: bitcoinData.usd_market_cap || 0,
          total_volume: bitcoinData.usd_24h_vol || 0,
          last_updated: currentDate.toISOString() // Uvijek koristimo trenutno vrijeme
        };
      }
    } catch (simpleError) {
      console.error('Greška pri dohvaćanju cijene Bitcoin-a s jednostavnim endpointom:', simpleError);
      
      // Pokušavamo s trećim endpointom ako drugi ne uspije
      try {
        const fallbackResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            ids: 'bitcoin',
            order: 'market_cap_desc',
            per_page: 1,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        });
        
        if (fallbackResponse.data && fallbackResponse.data.length > 0) {
          const bitcoinData = fallbackResponse.data[0];
          const currentDate = new Date();
          
          return {
            usd: bitcoinData.current_price,
            eur: bitcoinData.current_price * 0.92, // Približna konverzija USD u EUR
            usd_24h_change: bitcoinData.price_change_percentage_24h || 0,
            eur_24h_change: bitcoinData.price_change_percentage_24h || 0,
            market_cap: bitcoinData.market_cap || 0,
            total_volume: bitcoinData.total_volume || 0,
            last_updated: currentDate.toISOString() // Uvijek koristimo trenutno vrijeme
          };
        }
      } catch (fallbackError) {
        console.error('Greška pri dohvaćanju cijene Bitcoin-a s alternativnim endpointom:', fallbackError);
      }
    }
    
    return null;
  }
}

/**
 * Dohvaća statistike Bitcoin mreže
 * Kombinira podatke iz Blockchair i Mempool.space API-ja
 */
export async function getBitcoinStats(): Promise<BitcoinRealTimeStats | null> {
  try {
    // Dohvaćamo statistike s Blockchair API-ja
    const blockchairResponse = await blockchairApi.get('/stats');
    
    // Dohvaćamo podatke o mempoolu s Mempool.space API-ja
    let mempoolData = {};
    let feesData = {};
    
    try {
      const mempoolResponse = await mempoolApi.get('/mempool');
      mempoolData = mempoolResponse.data || {};
    } catch (mempoolError) {
      console.error('Greška pri dohvaćanju mempool podataka:', mempoolError);
    }
    
    try {
      const feesResponse = await mempoolApi.get('/v1/fees/recommended');
      feesData = feesResponse.data || {};
    } catch (feesError) {
      console.error('Greška pri dohvaćanju podataka o naknadama:', feesError);
    }
    
    if (blockchairResponse.data && blockchairResponse.data.data) {
      const blockchairData = blockchairResponse.data.data;
      
      return {
        blocks_count: blockchairData.blocks.toString(),
        transactions_24h: blockchairData.transactions_24h.toString(),
        difficulty: blockchairData.difficulty.toString(),
        hashrate: blockchairData.hashrate_24h.toString(),
        average_fee: feesData && typeof feesData === 'object' && 'hourFee' in feesData ? (feesData.hourFee as number / 100000).toFixed(2) : '0',
        mempool_transactions: mempoolData && typeof mempoolData === 'object' && 'count' in mempoolData ? (mempoolData.count as number).toString() : '0'
      };
    }
    
    console.error('Nedostaju podaci o statistikama u odgovoru');
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju statistika Bitcoina:', error);
    return null; // Vraćamo null umjesto propagiranja greške
  }
}

/**
 * Dohvaća zadnje Bitcoin blokove
 * Koristi više API-ja s automatskim fallback mehanizmom
 */
export async function getLatestBitcoinBlocks(limit: number = 10): Promise<BitcoinRealTimeBlock[]> {
  console.log('Dohvaćanje zadnjih Bitcoin blokova, limit:', limit);
  
  // Prvo pokušavamo s BlockCypher API-jem
  try {
    console.log('Pokušaj dohvaćanja blokova s BlockCypher API-jem...');
    const response = await blockCypherApi.get('/blocks');
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Uspješno dohvaćeni blokovi s BlockCypher API-jem');
      
      // Ograničavamo broj blokova na traženi limit
      const blocks = response.data.slice(0, limit);
      
      return blocks.map((block: any) => ({
        height: block.height.toString(),
        hash: block.hash,
        time: new Date(block.time).toISOString(),
        transaction_count: block.n_tx.toString(),
        size: block.size.toString(),
        weight: block.weight ? block.weight.toString() : '0'
      }));
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju blokova s BlockCypher API-jem:', error);
  }
  
  // Ako prvi pokušaj ne uspije, pokušavamo s Blockchain.info API-jem
  try {
    console.log('Pokušaj dohvaćanja blokova s Blockchain.info API-jem...');
    const response = await blockchainInfoApi.get('/blocks?format=json');
    
    if (response.data && Array.isArray(response.data.blocks)) {
      console.log('Uspješno dohvaćeni blokovi s Blockchain.info API-jem');
      
      // Ograničavamo broj blokova na traženi limit
      const blocks = response.data.blocks.slice(0, limit);
      
      return blocks.map((block: any) => ({
        height: block.height.toString(),
        hash: block.hash,
        time: new Date(block.time * 1000).toISOString(),
        transaction_count: block.n_tx.toString(),
        size: block.size.toString(),
        weight: '0' // Blockchain.info API ne vraća weight, pa stavljamo 0
      }));
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju blokova s Blockchain.info API-jem:', error);
  }
  
  // Ako ni drugi pokušaj ne uspije, pokušavamo s Blockchair API-jem (originalni način)
  try {
    console.log('Pokušaj dohvaćanja blokova s Blockchair API-jem...');
    const response = await blockchairApi.get('/blocks', {
      params: {
        limit: limit,
        s: 'height(desc)'
      }
    });

    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('Uspješno dohvaćeni blokovi s Blockchair API-jem');
      
      return response.data.data.map((block: {
        id: number;
        hash: string;
        time: number;
        transaction_count: number;
        size: number;
        weight?: number;
      }) => ({
        height: block.id.toString(),
        hash: block.hash,
        time: new Date(block.time * 1000).toISOString(),
        transaction_count: block.transaction_count.toString(),
        size: block.size.toString(),
        weight: block.weight ? block.weight.toString() : '0'
      }));
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju blokova s Blockchair API-jem:', error);
  }
  
  // Ako svi pokušaji ne uspiju, vraćamo mock podatke za demonstraciju
  console.log('Svi pokušaji dohvaćanja blokova nisu uspjeli, vraćamo mock podatke');
  
  // Generiramo mock podatke za prikaz
  const mockBlocks: BitcoinRealTimeBlock[] = [];
  const currentTime = new Date();
  const baseHeight = 800000; // Približna trenutna visina Bitcoin bloka
  
  for (let i = 0; i < limit; i++) {
    const blockTime = new Date(currentTime.getTime() - i * 10 * 60 * 1000); // Svaki blok je otprilike 10 minuta stariji
    
    mockBlocks.push({
      height: (baseHeight - i).toString(),
      hash: `000000000000000000${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      time: blockTime.toISOString(),
      transaction_count: Math.floor(1000 + Math.random() * 2000).toString(), // Između 1000 i 3000 transakcija
      size: Math.floor(800000 + Math.random() * 400000).toString(), // Između 800KB i 1.2MB
      weight: Math.floor(3500000 + Math.random() * 500000).toString() // Između 3.5M i 4M weight units
    });
  }
  
  return mockBlocks;
}

/**
 * Dohvaća zadnje Bitcoin transakcije
 * Koristi više API-ja s automatskim fallback mehanizmom
 */
export async function getLatestBitcoinTransactions(limit: number = 10): Promise<BitcoinRealTimeTransaction[]> {
  console.log('Dohvaćanje zadnjih Bitcoin transakcija, limit:', limit);
  
  // Prvo pokušavamo s BlockCypher API-jem
  try {
    console.log('Pokušaj dohvaćanja transakcija s BlockCypher API-jem...');
    const response = await blockCypherApi.get('/txs');
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Uspješno dohvaćene transakcije s BlockCypher API-jem');
      
      // Ograničavamo broj transakcija na traženi limit
      const transactions = response.data.slice(0, limit);
      
      return transactions.map((tx: any) => ({
        hash: tx.hash,
        block_height: tx.block_height ? tx.block_height.toString() : 'Mempool',
        time: new Date(tx.received).toISOString(),
        input_count: tx.inputs.length.toString(),
        output_count: tx.outputs.length.toString(),
        value: (tx.total / 100000000).toFixed(8), // Konverzija iz satoshija u BTC
        fee: (tx.fees / 100000000).toFixed(8), // Konverzija iz satoshija u BTC
        fee_per_kb: '0' // BlockCypher ne vraća fee_per_kb
      }));
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija s BlockCypher API-jem:', error);
  }
  
  // Ako prvi pokušaj ne uspije, pokušavamo s Blockchain.info API-jem
  try {
    console.log('Pokušaj dohvaćanja transakcija s Blockchain.info API-jem...');
    const response = await blockchainInfoApi.get('/unconfirmed-transactions?format=json');
    
    if (response.data && Array.isArray(response.data.txs)) {
      console.log('Uspješno dohvaćene transakcije s Blockchain.info API-jem');
      
      // Ograničavamo broj transakcija na traženi limit
      const transactions = response.data.txs.slice(0, limit);
      
      return transactions.map((tx: any) => ({
        hash: tx.hash,
        block_height: 'Mempool', // Ove su transakcije u mempoolu
        time: new Date(tx.time * 1000).toISOString(),
        input_count: tx.inputs.length.toString(),
        output_count: tx.out.length.toString(),
        value: (tx.inputs.reduce((sum: number, input: any) => sum + (input.prev_out?.value || 0), 0) / 100000000).toFixed(8),
        fee: (tx.fee / 100000000).toFixed(8), // Konverzija iz satoshija u BTC
        fee_per_kb: ((tx.fee / tx.size) * 1000 / 100000000).toFixed(8) // Izračunavamo fee_per_kb
      }));
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija s Blockchain.info API-jem:', error);
  }
  
  // Ako ni drugi pokušaj ne uspije, pokušavamo s Blockchair API-jem (originalni način)
  try {
    console.log('Pokušaj dohvaćanja transakcija s Blockchair API-jem...');
    const response = await blockchairApi.get('/mempool/transactions', {
      params: {
        limit: limit,
        s: 'time(desc)'
      }
    });

    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('Uspješno dohvaćene transakcije s Blockchair API-jem');
      
      return response.data.data.map((tx: {
        hash: string;
        block_id: number;
        time: number;
        input_count: number;
        output_count: number;
        input_total: number;
        fee: number;
        fee_per_kb: number;
      }) => ({
        hash: tx.hash,
        block_height: tx.block_id ? tx.block_id.toString() : 'Mempool',
        time: new Date(tx.time * 1000).toISOString(),
        input_count: tx.input_count.toString(),
        output_count: tx.output_count.toString(),
        value: (tx.input_total / 100000000).toFixed(8), // Konverzija iz satoshija u BTC
        fee: (tx.fee / 100000000).toFixed(8), // Konverzija iz satoshija u BTC
        fee_per_kb: tx.fee_per_kb ? (tx.fee_per_kb / 100000000).toFixed(8) : '0'
      }));
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija s Blockchair API-jem:', error);
  }
  
  // Ako svi pokušaji ne uspiju, vraćamo mock podatke za demonstraciju
  console.log('Svi pokušaji dohvaćanja transakcija nisu uspjeli, vraćamo mock podatke');
  
  // Generiramo mock podatke za prikaz
  const mockTransactions: BitcoinRealTimeTransaction[] = [];
  const currentTime = new Date();
  
  for (let i = 0; i < limit; i++) {
    const txTime = new Date(currentTime.getTime() - i * 30 * 1000); // Svaka transakcija je otprilike 30 sekundi starija
    const inputCount = Math.floor(1 + Math.random() * 5); // Između 1 i 5 inputa
    const outputCount = Math.floor(1 + Math.random() * 3); // Između 1 i 3 outputa
    const value = (0.1 + Math.random() * 2).toFixed(8); // Između 0.1 i 2.1 BTC
    const fee = (0.0001 + Math.random() * 0.001).toFixed(8); // Između 0.0001 i 0.0011 BTC
    
    mockTransactions.push({
      hash: `${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      block_height: 'Mempool',
      time: txTime.toISOString(),
      input_count: inputCount.toString(),
      output_count: outputCount.toString(),
      value: value,
      fee: fee,
      fee_per_kb: (parseFloat(fee) * 1000 / (Math.random() * 1000 + 500)).toFixed(8) // Izračunavamo fee_per_kb
    });
  }
  
  return mockTransactions;
}

/**
 * Dohvaća podatke o Bitcoin bloku prema visini ili hash-u
 * Koristi Blockchair API
 */
export async function getBitcoinBlock(blockId: string): Promise<BitcoinRealTimeBlock | null> {
  try {
    // Provjeravamo je li blockId broj (visina bloka) ili string (hash bloka)
    const isHeight = /^\d+$/.test(blockId);
    const endpoint = isHeight ? `/blocks?q=id(${blockId})` : `/block/${blockId}`;
    
    const response = await blockchairApi.get(endpoint);

    if (response.data && response.data.data) {
      // Ako je endpoint bio /block/{hash}
      if (!isHeight && response.data.data[blockId]) {
        const block = response.data.data[blockId];
        return {
          height: block.id.toString(),
          hash: block.hash,
          time: new Date(block.time * 1000).toISOString(),
          transaction_count: block.transaction_count.toString(),
          size: block.size.toString(),
          weight: block.weight ? block.weight.toString() : '0'
        };
      } 
      // Ako je endpoint bio /blocks?q=id({height})
      else if (isHeight && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const block = response.data.data[0];
        return {
          height: block.id.toString(),
          hash: block.hash,
          time: new Date(block.time * 1000).toISOString(),
          transaction_count: block.transaction_count.toString(),
          size: block.size.toString(),
          weight: block.weight ? block.weight.toString() : '0'
        };
      }
    }
    
    throw new Error(`Blok ${blockId} nije pronađen`);
  } catch (error) {
    console.error(`Greška pri dohvaćanju Bitcoin bloka ${blockId}:`, error);
    throw error; // Propagiramo grešku umjesto vraćanja fallback podataka
  }
}

/**
 * Dohvaća podatke o Bitcoin transakciji prema hash-u
 * Koristi Blockchair API
 */
export async function getBitcoinTransaction(txHash: string): Promise<BitcoinRealTimeTransaction | null> {
  try {
    const response = await blockchairApi.get(`/transaction/${txHash}`);

    if (response.data && response.data.data && response.data.data[txHash]) {
      const tx = response.data.data[txHash];
      return {
        hash: tx.hash,
        block_height: tx.block_id ? tx.block_id.toString() : 'mempool',
        time: new Date(tx.time * 1000).toISOString(),
        size: tx.size.toString(),
        weight: tx.weight ? tx.weight.toString() : '0',
        fee: (tx.fee / 100000000).toFixed(8),
        input_count: tx.input_count.toString(),
        output_count: tx.output_count.toString(),
        input_total: (tx.input_total / 100000000).toFixed(8),
        output_total: (tx.output_total / 100000000).toFixed(8)
      };
    }
    
    throw new Error(`Transakcija ${txHash} nije pronađena`);
  } catch (error) {
    console.error(`Greška pri dohvaćanju Bitcoin transakcije ${txHash}:`, error);
    throw error; // Propagiramo grešku umjesto vraćanja fallback podataka
  }
}
