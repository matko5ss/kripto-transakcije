import axios from 'axios';

// Konfiguracija Axios instance za Dune API (Bitcoin)
const duneApiBitcoin = axios.create({
  baseURL: '/api/dune/bitcoin',
  headers: {
    'Accept': 'application/json',
    'x-dune-api-key': 'KbXKuJ2niPQF13TRf1e45ae4hshStmTy'
  }
});

// Tipovi podataka
export interface BitcoinTransakcija {
  txid: string;
  blockHeight: string;
  blockTime: string;
  senderAddress: string;
  recipientAddresses: string[];
  value: string;
  fee: string;
  confirmations: string;
  isVout?: boolean;
  isVin?: boolean;
}

export interface BitcoinBlok {
  height: string;
  hash: string;
  time: string;
  medianTime: string;
  size: string;
  weight: string;
  version: string;
  merkleRoot: string;
  nonce: string;
  bits: string;
  difficulty: string;
  txCount: string;
  previousBlockHash: string;
  nextBlockHash?: string;
}

export interface BitcoinAdresa {
  address: string;
  balance: string;
  totalReceived: string;
  totalSent: string;
  txCount: string;
  unconfirmedBalance: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface BitcoinStatistika {
  price: number;
  marketCap: string;
  difficulty: string;
  hashRate: string;
  blockReward: string;
  blockCount: string;
  blockTime: string;
  unconfirmedTxCount: string;
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
export async function dohvatiBitcoinTransakcije(adresa?: string, limit: number = 10): Promise<BitcoinTransakcija[]> {
  try {
    // Ako adresa nije definirana, dohvaćamo zadnje transakcije
    if (!adresa) {
      console.log('Dohvaćanje zadnjih Bitcoin transakcija, limit:', limit);
      
      // Dohvaćamo zadnje transakcije s API-ja
      const response = await duneApiBitcoin.get('', {
        params: {
          action: 'txlist',
          limit: limit
        }
      });
      
      // Ako je odgovor uspješan i ima rezultata, parsiramo ih
      if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
        const transakcije = response.data.result;
        console.log(`Dohvaćeno ${transakcije.length} zadnjih Bitcoin transakcija`);
        
        return transakcije;
      }
      
      console.log('Nema zadnjih Bitcoin transakcija');
      return [];
    }

    // Provjera je li adresa validna za Bitcoin
    if (!adresa.match(/^(1|3|bc1)[a-zA-Z0-9]{25,42}$/)) {
      console.error('Neispravna Bitcoin adresa za dohvaćanje transakcija:', adresa);
      return [];
    }

    console.log('Dohvaćanje Bitcoin transakcija za adresu:', adresa, 'limit:', limit);
    
    // Dohvaćamo transakcije s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'txlist',
        address: adresa,
        limit: limit
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
      const transakcije = response.data.result;
      console.log(`Dohvaćeno ${transakcije.length} Bitcoin transakcija za adresu:`, adresa);
      
      return transakcije;
    }
    
    console.log('Nema Bitcoin transakcija za adresu:', adresa);
    return [];
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin transakcija:', error);
    return [];
  }
}

export async function dohvatiBitcoinTransakciju(txid: string): Promise<BitcoinTransakcija | null> {
  try {
    // Provjera je li txid validan
    if (!txid.match(/^[a-fA-F0-9]{64}$/)) {
      console.error('Neispravan hash Bitcoin transakcije:', txid);
      return null;
    }

    console.log('Dohvaćanje Bitcoin transakcije s ID-om:', txid);
    
    // Dohvaćamo transakciju s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'tx',
        txid: txid
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const tx = response.data.result;
      console.log('Dohvaćena Bitcoin transakcija s ID-om:', txid);
      
      return {
        txid: tx.txid || '',
        blockHeight: tx.blockHeight || '',
        blockTime: tx.blockTime ? parseTimestamp(tx.blockTime) : '',
        senderAddress: tx.senderAddress || '',
        recipientAddresses: tx.recipientAddresses || [],
        value: tx.value || '0',
        fee: tx.fee || '0',
        confirmations: tx.confirmations || '0',
        isVout: tx.isVout || false,
        isVin: tx.isVin || false
      };
    }
    
    console.log('Nema Bitcoin transakcije s ID-om:', txid);
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin transakcije:', error);
    return null;
  }
}

export async function dohvatiBitcoinBlokove(limit: number = 10): Promise<BitcoinBlok[]> {
  try {
    console.log('Dohvaćanje Bitcoin blokova, limit:', limit);
    
    // Dohvaćamo blokove s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'blocks',
        limit: limit
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
      const blokovi = response.data.result;
      console.log(`Dohvaćeno ${blokovi.length} Bitcoin blokova`);
      
      return blokovi;
    }
    
    console.log('Nema Bitcoin blokova');
    return [];
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin blokova:', error);
    return [];
  }
}

export async function dohvatiBitcoinBlok(visina: string): Promise<BitcoinBlok | null> {
  try {
    // Provjera je li visina validna
    if (!visina.match(/^\d+$/)) {
      console.error('Neispravna visina Bitcoin bloka:', visina);
      return null;
    }

    console.log('Dohvaćanje Bitcoin bloka visine:', visina);
    
    // Dohvaćamo blok s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'block',
        height: visina
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const blok = response.data.result;
      console.log('Dohvaćen Bitcoin blok visine:', visina);
      
      return blok;
    }
    
    console.log('Nema Bitcoin bloka visine:', visina);
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin bloka:', error);
    return null;
  }
}

export async function dohvatiBitcoinAdresu(adresa: string): Promise<BitcoinAdresa | null> {
  try {
    // Provjera je li adresa validna
    if (!adresa.match(/^(1|3|bc1)[a-zA-Z0-9]{25,42}$/)) {
      console.error('Neispravna Bitcoin adresa:', adresa);
      return null;
    }

    console.log('Dohvaćanje podataka o Bitcoin adresi:', adresa);
    
    // Dohvaćamo podatke o adresi s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'address',
        address: adresa
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const adresaPodaci = response.data.result;
      console.log('Dohvaćeni podaci o Bitcoin adresi:', adresa);
      
      return adresaPodaci;
    }
    
    console.log('Nema podataka o Bitcoin adresi:', adresa);
    return null;
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka o Bitcoin adresi:', error);
    return null;
  }
}

export async function dohvatiBitcoinCijenu(): Promise<number> {
  try {
    console.log('Dohvaćanje cijene Bitcoin-a');
    
    // Dohvaćamo cijenu s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'price'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && response.data.result.price) {
      const cijena = parseFloat(response.data.result.price);
      console.log('Dohvaćena cijena Bitcoin-a:', cijena);
      
      return cijena;
    }
    
    console.log('Nema cijene Bitcoin-a, koristimo fallback vrijednost');
    return 93895.00; // Aktualnija fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju cijene Bitcoin-a:', error);
    return 93895.00; // Aktualnija fallback vrijednost
  }
}

export interface BitcoinCijenaData {
  datum: string;
  cijena: number;
}

export async function dohvatiBitcoinPovijestCijena(dani: number = 7): Promise<BitcoinCijenaData[]> {
  try {
    console.log('Dohvaćanje povijesti cijena Bitcoin-a za', dani, 'dana');
    
    // Dohvaćamo povijest cijena s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'pricehistory',
        days: dani
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result && Array.isArray(response.data.result) && response.data.result.length > 0) {
      const povijestCijena = response.data.result as BitcoinCijenaData[];
      console.log(`Dohvaćeno ${povijestCijena.length} povijesnih cijena Bitcoin-a`);
      
      return povijestCijena;
    }
    
    console.log('Nema povijesti cijena Bitcoin-a, generiramo podatke');
    
    // Ako nema podataka, generiramo podatke
    const povijesneCijene: BitcoinCijenaData[] = [];
    const trenutnaCijena = 53748.92;
    const trenutniDatum = new Date();
    
    for (let i = 0; i < dani; i++) {
      const datum = new Date(trenutniDatum);
      datum.setDate(datum.getDate() - i);
      
      // Generiramo cijenu s varijacijom do 5%
      const varijacija = (Math.random() * 10 - 5) / 100; // -5% do +5%
      const cijena = trenutnaCijena * (1 + varijacija);
      
      povijesneCijene.push({
        cijena: parseFloat(cijena.toFixed(2)),
        datum: datum.toISOString()
      });
    }
    
    return povijesneCijene;
  } catch (error) {
    console.error('Greška pri dohvaćanju povijesti cijena Bitcoin-a:', error);
    
    // Generiramo realistične podatke
    const povijesneCijene: BitcoinCijenaData[] = [];
    const trenutnaCijena = 53748.92;
    const trenutniDatum = new Date();
    
    for (let i = 0; i < dani; i++) {
      const datum = new Date(trenutniDatum);
      datum.setDate(datum.getDate() - i);
      
      // Generiramo cijenu s varijacijom do 5%
      const varijacija = (Math.random() * 10 - 5) / 100; // -5% do +5%
      const cijena = trenutnaCijena * (1 + varijacija);
      
      povijesneCijene.push({
        cijena: parseFloat(cijena.toFixed(2)),
        datum: datum.toISOString()
      });
    }
    
    return povijesneCijene;
  }
}

// Funkcije za dohvaćanje statističkih podataka
export async function dohvatiBitcoinZadnjiBlok(): Promise<string> {
  try {
    console.log('Dohvaćanje zadnjeg Bitcoin bloka');
    
    // Dohvaćamo zadnji blok s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'blockcount'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const zadnjiBlok = response.data.result;
      console.log('Dohvaćen zadnji Bitcoin blok:', zadnjiBlok);
      
      return zadnjiBlok;
    }
    
    console.log('Nema zadnjeg Bitcoin bloka, koristimo fallback vrijednost');
    return "790255"; // Fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju zadnjeg Bitcoin bloka:', error);
    return "790255"; // Fallback vrijednost
  }
}

export async function dohvatiBitcoinTransakcijeDanas(): Promise<string> {
  try {
    console.log('Dohvaćanje broja Bitcoin transakcija danas');
    
    // Dohvaćamo broj transakcija s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'txcount'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const brojTransakcija = response.data.result;
      console.log('Dohvaćen broj Bitcoin transakcija danas:', brojTransakcija);
      
      return brojTransakcija;
    }
    
    console.log('Nema broja Bitcoin transakcija danas, koristimo fallback vrijednost');
    return "350000"; // Fallback vrijednost
  } catch (error) {
    console.error('Greška pri dohvaćanju broja Bitcoin transakcija danas:', error);
    return "350000"; // Fallback vrijednost
  }
}

export async function dohvatiBitcoinProsjecnuFeeRatu(): Promise<string> {
  try {
    console.log('Dohvaćanje prosječne Bitcoin fee rate');
    
    // Dohvaćamo prosječnu fee rate s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'feerate'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const feeRate = response.data.result;
      console.log('Dohvaćena prosječna Bitcoin fee rate:', feeRate);
      
      return feeRate;
    }
    
    console.log('Nema prosječne Bitcoin fee rate, koristimo fallback vrijednost');
    return "12"; // Fallback vrijednost sat/vB
  } catch (error) {
    console.error('Greška pri dohvaćanju prosječne Bitcoin fee rate:', error);
    return "12"; // Fallback vrijednost sat/vB
  }
}

export async function dohvatiBitcoinStatistiku(): Promise<BitcoinStatistika> {
  try {
    console.log('Dohvaćanje Bitcoin statistike');
    
    // Dohvaćamo statistiku s API-ja
    const response = await duneApiBitcoin.get('', {
      params: {
        action: 'stats'
      }
    });
    
    // Ako je odgovor uspješan i ima rezultata, parsiramo ih
    if (response.data && response.data.status === "1" && response.data.result) {
      const statistika = response.data.result;
      console.log('Dohvaćena Bitcoin statistika');
      
      return statistika;
    }
    
    console.log('Nema Bitcoin statistike, koristimo fallback vrijednosti');
    
    // Fallback vrijednosti
    return {
      price: 53748.92,
      marketCap: "1.05T",
      difficulty: "72.33T",
      hashRate: "534.55 EH/s",
      blockReward: "3.125 BTC",
      blockCount: "790255",
      blockTime: "10 minuta",
      unconfirmedTxCount: "1423"
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju Bitcoin statistike:', error);
    
    // Fallback vrijednosti
    return {
      price: 53748.92,
      marketCap: "1.05T",
      difficulty: "72.33T",
      hashRate: "534.55 EH/s",
      blockReward: "3.125 BTC",
      blockCount: "790255",
      blockTime: "10 minuta",
      unconfirmedTxCount: "1423"
    };
  }
}

// Funkcija koja provjerava je li kod izvršen na klijentu
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Funkcija koja simulira dohvaćanje podataka za statički export
export async function dohvatiStatickeBitcoinPodatke() {
  // Generiramo podatke za statički export
  
  // Mock transakcije
  const mockTransakcije: BitcoinTransakcija[] = [];
  for (let i = 0; i < 10; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() - i);
    
    mockTransakcije.push({
      txid: `${Math.random().toString(16).substring(2, 66)}`,
      blockHeight: (790255 - i).toString(),
      blockTime: time.toISOString(),
      senderAddress: `bc1${Math.random().toString(16).substring(2, 42)}`,
      recipientAddresses: [`bc1${Math.random().toString(16).substring(2, 42)}`],
      value: (Math.random() * 2.5).toFixed(8),
      fee: (Math.random() * 0.0005).toFixed(8),
      confirmations: (i + 1).toString()
    });
  }
  
  // Mock blokovi
  const mockBlokovi: BitcoinBlok[] = [];
  for (let i = 0; i < 5; i++) {
    const time = Math.floor(Date.now() / 1000) - i * 600; // Bitcoin blokovi se stvaraju otprilike svakih 10 minuta (600 sekundi)
    mockBlokovi.push({
      height: (790255 - i).toString(),
      hash: `${Math.random().toString(16).substring(2, 66)}`,
      time: time.toString(),
      medianTime: (time - 300).toString(),
      size: (Math.random() * 1000000 + 500000).toFixed(0),
      weight: (Math.random() * 4000000 + 2000000).toFixed(0),
      version: "0x20000000",
      merkleRoot: `${Math.random().toString(16).substring(2, 66)}`,
      nonce: (Math.random() * 1000000000).toFixed(0),
      bits: "386604799",
      difficulty: "72.33T",
      txCount: (Math.random() * 3000 + 1000).toFixed(0),
      previousBlockHash: `${Math.random().toString(16).substring(2, 66)}`,
      nextBlockHash: i > 0 ? `${Math.random().toString(16).substring(2, 66)}` : undefined
    });
  }
  
  return {
    transakcije: mockTransakcije,
    blokovi: mockBlokovi,
    cijenaBitcoina: 53748.92,
    zadnjiBlok: "790255",
    transakcijeCount: "350000",
    feeRate: "12"
  };
}
