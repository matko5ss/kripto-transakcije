import axios from 'axios';

// Konfiguracija Axios instance za Dune API
const duneApi = axios.create({
  baseURL: '/api/dune',
  headers: {
    'Accept': 'application/json'
  }
});

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
  isError: string; // Dodano polje isError
  isContract?: boolean;
  contractCreation?: boolean;
  methodId?: string;
  functionName?: string;
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
  isContract?: boolean;
  contractCreator?: string;
  contractCreationTx?: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface Token {
  name: string;
  symbol: string;
  decimals: string;
  contractAddress: string;
  balance: string;
  price?: string;
  totalSupply?: string;
}

export interface AdresaStatistika {
  poslanoTransakcija: number;
  primljenoTransakcija: number;
  poslanoEth: number;
  primljenoEth: number;
  prosjecniGas: number;
  ukupnoPotrosenoGas: number;
}

// Pomoćne funkcije za parsiranje podataka
export function parseTimestamp(timestamp: string | number): string {
  if (typeof timestamp === 'string') {
    // Ako je timestamp već string, pokušamo ga parsirati
    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum)) {
      return timestamp; // Vraćamo originalni string ako nije broj
    }
    timestamp = timestampNum;
  }
  
  // Pretvaramo Unix timestamp u ISO string
  return new Date(timestamp * 1000).toISOString();
}

// Funkcije za dohvaćanje podataka
export async function dohvatiTransakcije(adresa?: string, limit: number = 10): Promise<Transakcija[]> {
  try {
    // Ako adresa nije definirana, dohvaćamo zadnje transakcije
    if (!adresa) {
      console.log('Dohvaćanje zadnjih transakcija, limit:', limit);
      
      // Dohvaćamo zadnje transakcije s API-ja
      const response = await duneApi.get('', {
        params: {
          action: 'txlist',
          limit: limit
        }
      });
      
      // Ako je odgovor uspješan i ima rezultata, parsiramo ih
      if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
        const transakcije = response.data.result;
        console.log(`Dohvaćeno ${transakcije.length} zadnjih transakcija`);
        
        return transakcije;
      }
      
      console.log('Nema zadnjih transakcija');
      return [];
    }

    // Provjera je li adresa validna
    if (!adresa.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('Neispravna Ethereum adresa za dohvaćanje transakcija:', adresa);
      return [];
    }

    console.log('Dohvaćanje transakcija za adresu:', adresa, 'limit:', limit);
    
    // Dohvaćamo transakcije s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'txlist',
        address: adresa,
        limit: limit
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
      const transakcije = response.data.result;
      console.log(`Dohvaćeno ${transakcije.length} transakcija za adresu:`, adresa);
      
      return transakcije;
    }
    
    console.log('Nema transakcija za adresu:', adresa);
    return [];
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija:', error);
    return [];
  }
}

export async function dohvatiTransakciju(hash: string): Promise<Transakcija | null> {
  try {
    // Provjera je li hash validan
    if (!hash.match(/^0x[a-fA-F0-9]{64}$/)) {
      console.error('Neispravan hash transakcije:', hash);
      return null;
    }

    console.log('Dohvaćanje transakcije s hashom:', hash);
    
    // Dohvaćamo transakciju s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'tx',
        txhash: hash
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const tx = response.data.result;
      console.log('Dohvaćena transakcija s hashom:', hash);
      
      return {
        hash: tx.hash || '',
        blockNumber: tx.blockNumber || '',
        blockTimestamp: tx.timeStamp ? parseTimestamp(tx.timeStamp) : '',
        from: tx.from || '',
        to: tx.to || '',
        value: tx.value || '0',
        gas: tx.gas || '0',
        gasPrice: tx.gasPrice || '0',
        isError: tx.isError || '', // Dodano polje isError
        isContract: tx.contractAddress ? true : false,
        contractCreation: tx.contractAddress ? true : false,
        methodId: tx.methodId || '',
        functionName: tx.functionName || ''
      };
    }
    
    console.log('Nema transakcije s hashom:', hash);
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcije:', error);
    return null;
  }
}

export async function dohvatiBlokove(limit: number = 10): Promise<Blok[]> {
  try {
    console.log('Dohvaćanje blokova, limit:', limit);
    
    // Dohvaćamo blokove s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'blocks',
        limit: limit
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
      const blokovi = response.data.result;
      console.log(`Dohvaćeno ${blokovi.length} blokova`);
      
      return blokovi.map((blok: {
        number?: string;
        timestamp?: string;
        hash?: string;
        parentHash?: string;
        nonce?: string;
        difficulty?: string;
        gasLimit?: string;
        gasUsed?: string;
        miner?: string;
        transactions?: string[];
      }) => ({
        number: blok.number || '',
        timestamp: blok.timestamp ? parseTimestamp(blok.timestamp) : '',
        hash: blok.hash || '',
        parentHash: blok.parentHash || '',
        nonce: blok.nonce || '',
        difficulty: blok.difficulty || '',
        gasLimit: blok.gasLimit || '',
        gasUsed: blok.gasUsed || '',
        miner: blok.miner || '',
        transactions: blok.transactions || []
      }));
    }
    
    console.log('Nema blokova');
    return [];
  } catch (error) {
    console.error('Greška pri dohvaćanju blokova:', error);
    return [];
  }
}

export async function dohvatiBlok(brojBloka: string): Promise<Blok | null> {
  try {
    console.log('Dohvaćanje bloka broj:', brojBloka);
    
    // Dohvaćamo blok s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'block',
        blockno: brojBloka
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const blok = response.data.result;
      console.log('Dohvaćen blok broj:', brojBloka);
      
      return {
        number: blok.number || '',
        timestamp: blok.timestamp ? parseTimestamp(blok.timestamp) : '',
        hash: blok.hash || '',
        parentHash: blok.parentHash || '',
        nonce: blok.nonce || '',
        difficulty: blok.difficulty || '',
        gasLimit: blok.gasLimit || '',
        gasUsed: blok.gasUsed || '',
        miner: blok.miner || '',
        transactions: blok.transactions || []
      };
    }
    
    console.log('Nema bloka broj:', brojBloka);
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju bloka:', error);
    return null;
  }
}

export async function dohvatiAdresu(adresa: string): Promise<Adresa | null> {
  try {
    // Provjera je li adresa validna
    if (!adresa.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('Neispravna Ethereum adresa:', adresa);
      return null;
    }

    console.log('Dohvaćanje adrese:', adresa);
    
    // Dohvaćamo stanje računa s API-ja
    const balanceResponse = await duneApi.get('', {
      params: {
        action: 'balance',
        address: adresa
      }
    });
    
    // Ako je odgovor uspješan, parsiramo ga
    if (balanceResponse.data && balanceResponse.data.status === "1" && balanceResponse.data.result) {
      const balance = balanceResponse.data.result;
      console.log('Dohvaćeno stanje računa za adresu:', adresa, balance);
      
      // Dohvaćamo dodatne informacije o adresi
      const infoResponse = await duneApi.get('', {
        params: {
          action: 'addressinfo',
          address: adresa
        }
      });
      
      let isContract = false;
      let contractCreator = '';
      let contractCreationTx = '';
      let firstSeen = '';
      let lastSeen = '';
      
      // Ako je odgovor uspješan, parsiramo dodatne informacije
      if (infoResponse.data && infoResponse.data.status === "1" && infoResponse.data.result) {
        const info = infoResponse.data.result;
        isContract = info.isContract || false;
        contractCreator = info.contractCreator || '';
        contractCreationTx = info.contractCreationTx || '';
        firstSeen = info.firstSeen ? parseTimestamp(info.firstSeen) : '';
        lastSeen = info.lastSeen ? parseTimestamp(info.lastSeen) : '';
      }
      
      return {
        balance,
        nonce: '0', // Dune API ne vraća nonce, pa koristimo defaultnu vrijednost
        isContract,
        contractCreator,
        contractCreationTx,
        firstSeen,
        lastSeen
      };
    }
    
    console.log('Nema adrese:', adresa);
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju adrese:', error);
    return null;
  }
}

export async function dohvatiTokene(adresa: string): Promise<Token[]> {
  try {
    // Provjera je li adresa validna
    if (!adresa.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('Neispravna Ethereum adresa za dohvaćanje tokena:', adresa);
      return [];
    }

    console.log('Dohvaćanje tokena za adresu:', adresa);
    
    // Dohvaćamo token transakcije s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'tokentx',
        address: adresa,
        limit: 100
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
      const tokenTransakcije = response.data.result;
      console.log(`Dohvaćeno ${tokenTransakcije.length} token transakcija za adresu:`, adresa);
      
      // Izvlačimo jedinstvene tokene iz transakcija
      const tokeni = new Map<string, Token>();
      
      for (const tx of tokenTransakcije) {
        if (tx.contractAddress && tx.tokenName && tx.tokenSymbol && tx.tokenDecimal) {
          const contractAddress = tx.contractAddress;
          
          if (!tokeni.has(contractAddress)) {
            tokeni.set(contractAddress, {
              name: tx.tokenName,
              symbol: tx.tokenSymbol,
              decimals: tx.tokenDecimal,
              contractAddress,
              balance: '0', // Početna vrijednost
              price: '',
              totalSupply: ''
            });
          }
        }
      }
      
      console.log(`Pronađeno ${tokeni.size} jedinstvenih tokena za adresu:`, adresa);
      return Array.from(tokeni.values());
    }
    
    console.log('Nema token transakcija za adresu:', adresa);
    return [];
  } catch (error) {
    console.error('Greška pri dohvaćanju tokena:', error);
    return [];
  }
}

export async function dohvatiCijenuEthera(): Promise<number> {
  try {
    console.log('Dohvaćanje cijene Ethereuma');
    
    // Dohvaćamo cijenu Ethereuma s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'ethprice'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && response.data.result.ethusd) {
      const cijena = parseFloat(response.data.result.ethusd);
      console.log('Dohvaćena cijena Ethereuma:', cijena);
      return cijena;
    }
    
    console.log('Nema cijene Ethereuma, vraćamo fallback vrijednost');
    return 1805.97; // Fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju cijene Ethereuma:', error);
    return 1805.97; // Fallback vrijednost
  }
}

export interface CijenaData {
  datum: string;
  cijena: number;
}

export async function dohvatiPovijestCijenaEthera(dani: number): Promise<CijenaData[]> {
  try {
    console.log('Dohvaćanje povijesti cijena za', dani, 'dana');
    
    // Dohvaćamo povijest cijena s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'pricehistory',
        days: dani
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const povijestCijena: CijenaData[] = [];
      
      // Parsiramo rezultate
      for (const cijena of response.data.result) {
        povijestCijena.push({
          datum: cijena.datum,
          cijena: parseFloat(cijena.cijena)
        });
      }
      
      console.log('Dohvaćena povijest cijena:', povijestCijena);
      return povijestCijena;
    }
    
    console.log('Nema povijesti cijena, vraćamo prazno polje');
    return [];
  } catch (error) {
    console.error('Greška pri dohvaćanju povijesti cijena:', error);
    return [];
  }
}

export async function dohvatiAdresuStatistiku(adresa: string): Promise<AdresaStatistika> {
  try {
    // Provjera je li adresa validna
    if (!adresa.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('Neispravna Ethereum adresa za dohvaćanje statistike:', adresa);
      return {
        poslanoTransakcija: 0,
        primljenoTransakcija: 0,
        poslanoEth: 0,
        primljenoEth: 0,
        prosjecniGas: 0,
        ukupnoPotrosenoGas: 0
      };
    }

    console.log('Dohvaćanje statistike za adresu:', adresa);
    
    // Dohvaćamo transakcije za adresu
    const transakcije = await dohvatiTransakcije(adresa, 100);
    
    if (transakcije.length === 0) {
      console.log('Nema transakcija za statistiku adrese:', adresa);
      return {
        poslanoTransakcija: 0,
        primljenoTransakcija: 0,
        poslanoEth: 0,
        primljenoEth: 0,
        prosjecniGas: 0,
        ukupnoPotrosenoGas: 0
      };
    }
    
    // Računamo statistiku
    let poslanoTransakcija = 0;
    let primljenoTransakcija = 0;
    let poslanoEth = 0;
    let primljenoEth = 0;
    let ukupniGas = 0;
    let ukupnoPotrosenoGas = 0;
    
    for (const tx of transakcije) {
      const value = parseFloat(tx.value) / 1e18; // Pretvaramo u ETH
      const gas = parseInt(tx.gas);
      const gasPrice = parseInt(tx.gasPrice) / 1e9; // Pretvaramo u Gwei
      
      if (tx.from.toLowerCase() === adresa.toLowerCase()) {
        // Poslana transakcija
        poslanoTransakcija++;
        poslanoEth += value;
        ukupniGas += gas;
        ukupnoPotrosenoGas += gas * gasPrice;
      } else if (tx.to.toLowerCase() === adresa.toLowerCase()) {
        // Primljena transakcija
        primljenoTransakcija++;
        primljenoEth += value;
      }
    }
    
    const prosjecniGas = poslanoTransakcija > 0 ? ukupniGas / poslanoTransakcija : 0;
    
    return {
      poslanoTransakcija,
      primljenoTransakcija,
      poslanoEth,
      primljenoEth,
      prosjecniGas,
      ukupnoPotrosenoGas
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike adrese:', error);
    return {
      poslanoTransakcija: 0,
      primljenoTransakcija: 0,
      poslanoEth: 0,
      primljenoEth: 0,
      prosjecniGas: 0,
      ukupnoPotrosenoGas: 0
    };
  }
}

// Funkcije za dohvaćanje statističkih podataka
export async function dohvatiZadnjiBlok(): Promise<string> {
  try {
    console.log('Dohvaćanje zadnjeg bloka');
    
    // Dohvaćamo zadnji blok s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'blocks'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const blockNumber = response.data.result;
      console.log('Dohvaćen zadnji blok:', blockNumber);
      return blockNumber;
    }
    
    console.log('Nema zadnjeg bloka, vraćamo fallback vrijednost');
    return '22417536'; // Ažurirana fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju zadnjeg bloka:', error);
    return '22417536'; // Ažurirana fallback vrijednost
  }
}

export async function dohvatiTransakcijeDanas(): Promise<string> {
  try {
    console.log('Dohvaćanje broja transakcija');
    
    // Dohvaćamo broj transakcija s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'txcount'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const txCount = response.data.result;
      console.log('Dohvaćen broj transakcija:', txCount);
      return txCount;
    }
    
    console.log('Nema broja transakcija, vraćamo fallback vrijednost');
    return '1250000000'; // Fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju broja transakcija:', error);
    return '1250000000'; // Fallback vrijednost
  }
}

export async function dohvatiGasCijenu(): Promise<string> {
  try {
    console.log('Dohvaćanje gas cijene');
    
    // Dohvaćamo gas cijenu s API-ja
    const response = await duneApi.get('', {
      params: {
        action: 'gastracker'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && response.data.result.ProposeGasPrice) {
      const gasCijena = response.data.result.ProposeGasPrice;
      console.log('Dohvaćena gas cijena:', gasCijena);
      return gasCijena;
    }
    
    console.log('Nema gas cijene, vraćamo fallback vrijednost');
    return '25'; // Fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju gas cijene:', error);
    return '25'; // Fallback vrijednost
  }
}

// Funkcija koja provjerava je li kod izvršen na klijentu
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Funkcija koja simulira dohvaćanje podataka za statički export
export async function dohvatiStatickePodatke() {
  // Generiramo realistične mock podatke
  const trenutnoVrijeme = Date.now();
  const transakcije: Transakcija[] = [];
  
  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(trenutnoVrijeme - i * 15000); // Svaka transakcija je 15 sekundi starija
    
    transakcije.push({
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: (22417536 - i).toString(),
      blockTimestamp: timestamp.toISOString(),
      from: `0x${Math.random().toString(16).substring(2, 42)}`,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      value: (Math.random() * 10).toFixed(6),
      gas: (21000 + Math.floor(Math.random() * 50000)).toString(),
      gasPrice: (20 + Math.random() * 10).toFixed(2),
      isError: '', // Dodano polje isError
      isContract: false,
      contractCreation: false,
      methodId: '',
      functionName: ''
    });
  }
  
  return {
    transakcije,
    cijenaEthera: 1805.97,
    zadnjiBlok: '22417536',
    transakcijeCount: '1250000000',
    gasCijena: '25'
  };
}
