// app.js - Glavna JavaScript datoteka za Kripto Transakcije aplikaciju

// Konfiguracija za API pozive
const ETHERSCAN_PROXY_URL = 'etherscan_proxy.php'; // PHP proxy za Etherscan API

// Globalne varijable
let ethPrice = { usd: 0, btc: 0 };
let zadnjiBlokovi = [];
let gasInfo = {};
let networkStats = {};
let tokenTransakcije = [];

// Funkcija za dohvaćanje cijene Ethereuma
async function dohvatiCijenuEthereuma() {
  try {
    console.log('Dohvaćam cijenu Ethereuma...');
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=ethprice`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dohvaćena cijena Ethereuma:', data);
    
    if (data.status === "1" && data.result) {
      ethPrice = {
        usd: parseFloat(data.result.ethusd) || 0,
        btc: parseFloat(data.result.ethbtc) || 0
      };
      
      console.log('Cijena Ethereuma:', ethPrice);
      
      // Ažuriraj prikaz cijene u headeru
      prikaziCijenuEthereuma();
      
      // Ažuriraj i karticu s cijenom
      const ethPriceCard = document.getElementById('eth-price-card');
      if (ethPriceCard) {
        ethPriceCard.textContent = `$${ethPrice.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    } else {
      console.error('Neispravan format odgovora za cijenu Ethereuma:', data);
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju cijene Ethereuma:', error);
  }
}

// Funkcija za dohvaćanje informacija o gasu
async function dohvatiGasInfo() {
  try {
    console.log('Dohvaćam informacije o gasu...');
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=gastracker`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dohvaćene informacije o gasu:', data);
    
    if (data.status === "1" && data.result) {
      gasInfo = data.result;
      
      console.log('Gas info:', gasInfo);
      
      // Ažuriraj prikaz gas informacija
      prikaziGasInfo();
      
      // Ažuriraj i karticu s gas cijenom
      const gasPriceCard = document.getElementById('gas-price-card');
      if (gasPriceCard) {
        gasPriceCard.textContent = `${gasInfo.ProposeGasPrice || 0} Gwei`;
      }
    } else {
      console.error('Neispravan format odgovora za gas informacije:', data);
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju informacija o gasu:', error);
  }
}

// Funkcija za dohvaćanje zadnjih blokova
async function dohvatiZadnjeBlokove() {
  try {
    // Dohvati trenutni broj bloka
    console.log('Dohvaćam zadnje blokove...');
    const latestBlockResponse = await fetch(`${ETHERSCAN_PROXY_URL}?action=block&blockno=latest`);
    
    if (!latestBlockResponse.ok) {
      throw new Error(`API greška: ${latestBlockResponse.status}`);
    }
    
    const latestBlockData = await latestBlockResponse.json();
    console.log('Dohvaćen zadnji blok:', latestBlockData);
    
    if (!latestBlockData.result) {
      throw new Error('Nije moguće dohvatiti zadnji blok');
    }
    
    const latestBlockNumber = parseInt(latestBlockData.result, 16);
    console.log('Zadnji broj bloka:', latestBlockNumber);
    
    // Ažuriraj karticu s zadnjim blokom
    const latestBlockCard = document.getElementById('latest-block-card');
    if (latestBlockCard) {
      latestBlockCard.textContent = latestBlockNumber.toString();
    }
    
    // Dohvati zadnjih 5 blokova
    zadnjiBlokovi = [];
    for (let i = 0; i < 5; i++) {
      const blockNumber = latestBlockNumber - i;
      console.log(`Dohvaćam blok ${blockNumber}...`);
      const blockResponse = await fetch(`${ETHERSCAN_PROXY_URL}?action=block&blockno=${blockNumber}`);
      
      if (!blockResponse.ok) {
        console.error(`Greška pri dohvaćanju bloka ${blockNumber}: ${blockResponse.status}`);
        continue;
      }
      
      const blockData = await blockResponse.json();
      console.log(`Dohvaćen blok ${blockNumber}:`, blockData);
      
      if (blockData.result) {
        zadnjiBlokovi.push(blockData.result);
      }
    }
    
    // Ažuriraj prikaz zadnjih blokova
    prikaziZadnjeBlokove();
  } catch (error) {
    console.error('Greška pri dohvaćanju zadnjih blokova:', error);
  }
}

// Funkcija za prikaz cijene Ethereuma
function prikaziCijenuEthereuma() {
  const ethPriceElement = document.getElementById('eth-price-value');
  if (ethPriceElement) {
    ethPriceElement.textContent = `$${ethPrice.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  const ethPriceCard = document.getElementById('eth-price-card');
  if (ethPriceCard) {
    ethPriceCard.textContent = `$${ethPrice.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

// Funkcija za prikaz informacija o gasu
function prikaziGasInfo() {
  const gasInfoElement = document.getElementById('gas-price-value');
  if (gasInfoElement && gasInfo.ProposeGasPrice) {
    gasInfoElement.textContent = `${gasInfo.ProposeGasPrice} Gwei`;
  }
  
  const gasPriceCard = document.getElementById('gas-price-card');
  if (gasPriceCard && gasInfo.ProposeGasPrice) {
    gasPriceCard.textContent = `${gasInfo.ProposeGasPrice} Gwei`;
  }
}

// Funkcija za prikaz zadnjih blokova
function prikaziZadnjeBlokove() {
  const zadnjiBlockoviElement = document.getElementById('zadnji-blokovi-tablica');
  if (zadnjiBlockoviElement && zadnjiBlokovi.length > 0) {
    let html = '';
    
    zadnjiBlokovi.forEach(blok => {
      const timestamp = blok.timestamp ? parseInt(blok.timestamp, 16) : 0;
      const formattedTime = formatirajVrijeme(timestamp);
      const numTransactions = blok.transactions ? blok.transactions.length : 0;
      const miner = blok.miner ? skratiHash(blok.miner) : 'Nepoznato';
      const size = blok.size ? parseInt(blok.size, 16) : 0;
      
      html += `
        <tr class="table-row">
          <td class="px-4 py-2 text-white"><a href="#" class="text-blue-400 hover:text-blue-300" onclick="pretrazi('${blok.number}')">${parseInt(blok.number, 16)}</a></td>
          <td class="px-4 py-2 text-gray-300">${formattedTime}</td>
          <td class="px-4 py-2 text-gray-300">${numTransactions}</td>
          <td class="px-4 py-2 text-gray-300"><a href="#" class="text-blue-400 hover:text-blue-300" onclick="pretrazi('${blok.miner}')">${miner}</a></td>
          <td class="px-4 py-2 text-gray-300">${size} bajta</td>
        </tr>
      `;
    });
    
    zadnjiBlockoviElement.innerHTML = html;
  }
  
  // Ažuriraj i karticu s zadnjim blokom
  const latestBlockCard = document.getElementById('latest-block-card');
  if (latestBlockCard && zadnjiBlokovi.length > 0) {
    latestBlockCard.textContent = parseInt(zadnjiBlokovi[0].number, 16).toString();
  }
}

// Funkcija za dohvaćanje statistike mreže
async function dohvatiStatistikuMreze() {
  try {
    console.log('Dohvaćam statistiku mreže...');
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=stats`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dohvaćena statistika mreže:', data);
    
    if (data.status === "1" && data.result) {
      networkStats = {
        ethSupply: parseFloat(data.result) / 1e18
      };
      
      console.log('Statistika mreže:', networkStats);
      
      // Ažuriraj prikaz statistike mreže
      prikaziStatistikuMreze();
    } else {
      console.error('Neispravan format odgovora za statistiku mreže:', data);
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike mreže:', error);
  }
}

// Funkcija za dohvaćanje token transakcija za adresu
async function dohvatiTokenTransakcije(adresa, limit = 10) {
  try {
    console.log(`Dohvaćam token transakcije za adresu ${adresa}...`);
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=tokentx&address=${adresa}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Dohvaćeni podaci token transakcija:`, data);
    
    if (data.status !== "1" && data.result !== "Max rate limit reached") {
      throw new Error(`API greška: ${data.message}`);
    }
    
    // Transformiraj podatke u format koji aplikacija očekuje
    tokenTransakcije = data.result.map(tx => ({
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      blockTimestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      tokenName: tx.tokenName,
      tokenSymbol: tx.tokenSymbol,
      value: (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toFixed(6)
    }));
    
    // Ažuriraj prikaz token transakcija
    prikaziTokenTransakcije();
    
    return tokenTransakcije;
  } catch (error) {
    console.error('Greška pri dohvaćanju token transakcija:', error);
    return [];
  }
}

// Funkcija za dohvaćanje NFT transakcija za adresu
async function dohvatiNFTTransakcije(adresa, limit = 10) {
  try {
    console.log(`Dohvaćam NFT transakcije za adresu ${adresa}...`);
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=tokennfttx&address=${adresa}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Dohvaćeni podaci NFT transakcija:`, data);
    
    if (data.status !== "1" && data.result !== "Max rate limit reached") {
      throw new Error(`API greška: ${data.message}`);
    }
    
    // Transformiraj podatke u format koji aplikacija očekuje
    return data.result.map(tx => ({
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      blockTimestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      tokenName: tx.tokenName,
      tokenId: tx.tokenID,
      tokenSymbol: tx.tokenSymbol
    }));
  } catch (error) {
    console.error('Greška pri dohvaćanju NFT transakcija:', error);
    return [];
  }
}

// Funkcija za dohvaćanje izrudarenih blokova za adresu
async function dohvatiIzrudareneBlokove(adresa, limit = 10) {
  try {
    console.log(`Dohvaćam izrudarene blokove za adresu ${adresa}...`);
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=getminedblocks&address=${adresa}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Dohvaćeni podaci izrudarenih blokova:`, data);
    
    if (data.status !== "1" && data.result !== "Max rate limit reached") {
      throw new Error(`API greška: ${data.message}`);
    }
    
    // Transformiraj podatke u format koji aplikacija očekuje
    return data.result.map(blok => ({
      blockNumber: blok.blockNumber,
      blockTimestamp: new Date(parseInt(blok.timeStamp) * 1000).toISOString(),
      blockReward: (parseFloat(blok.blockReward) / 1e18).toFixed(6)
    }));
  } catch (error) {
    console.error('Greška pri dohvaćanju izrudarenih blokova:', error);
    return [];
  }
}

// Funkcija za prikaz statistike mreže
function prikaziStatistikuMreze() {
  const ethSupplyCard = document.getElementById('eth-supply-card');
  if (ethSupplyCard && networkStats.ethSupply) {
    ethSupplyCard.textContent = `${networkStats.ethSupply.toLocaleString('hr-HR')} ETH`;
  }
}

// Funkcija za prikaz token transakcija
function prikaziTokenTransakcije() {
  const tokenTransakcijeElement = document.getElementById('token-transakcije');
  if (tokenTransakcijeElement && tokenTransakcije.length > 0) {
    let html = '';
    
    tokenTransakcije.forEach(tx => {
      const vrijeme = formatirajVrijeme(tx.blockTimestamp);
      
      html += `
        <tr class="table-row">
          <td class="px-4 py-3 text-sm text-blue-400">${skratiHash(tx.hash)}</td>
          <td class="px-4 py-3 text-sm">${vrijeme}</td>
          <td class="px-4 py-3 text-sm">${tx.tokenName} (${tx.tokenSymbol})</td>
          <td class="px-4 py-3 text-sm">${skratiHash(tx.from)}</td>
          <td class="px-4 py-3 text-sm">${skratiHash(tx.to)}</td>
          <td class="px-4 py-3 text-sm">${tx.value}</td>
        </tr>
      `;
    });
    
    tokenTransakcijeElement.innerHTML = html;
  }
}

// Funkcija za dohvaćanje cijene Ethereuma
async function dohvatiCijenuEthereuma() {
  try {
    console.log('Dohvaćam cijenu Ethereuma...');
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=ethprice`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dohvaćena cijena Ethereuma:', data);
    
    if (data.status === "1" && data.result) {
      ethPrice = {
        usd: parseFloat(data.result.ethusd) || 0,
        btc: parseFloat(data.result.ethbtc) || 0
      };
      
      // Ažuriraj prikaz cijene u headeru
      prikaziCijenuEthereuma();
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju cijene Ethereuma:', error);
  }
}

// Funkcija za prikaz cijene Ethereuma
function prikaziCijenuEthereuma() {
  const ethPriceElement = document.getElementById('eth-price-value');
  if (ethPriceElement) {
    ethPriceElement.textContent = `$${ethPrice.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  const ethPriceCard = document.getElementById('eth-price-card');
  if (ethPriceCard) {
    ethPriceCard.textContent = `$${ethPrice.usd.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

// Funkcije za API pozive
async function dohvatiTransakcije(adresa, limit = 20) {
  try {
    console.log(`Dohvaćam transakcije za adresu ${adresa}...`);
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=txlist&address=${adresa}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dohvaćene transakcije:', data);
    
    if (data.status === "1" && data.result) {
      return data.result;
    } else {
      console.error('Neispravan format odgovora za transakcije:', data);
      return [];
    }
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcija:', error);
    return [];
  }
}

async function dohvatiAdresu(adresa) {
  try {
    console.log(`Dohvaćam podatke za adresu ${adresa}...`);
    
    // Dohvati stanje računa
    const balanceResponse = await fetch(`${ETHERSCAN_PROXY_URL}?action=balance&address=${adresa}`);
    
    if (!balanceResponse.ok) {
      throw new Error(`API greška: ${balanceResponse.status}`);
    }
    
    const balanceData = await balanceResponse.json();
    console.log('Dohvaćeno stanje računa:', balanceData);
    
    if (balanceData.status !== "1") {
      throw new Error('Neispravan format odgovora za stanje računa');
    }
    
    // Dohvati transakcije za ovu adresu
    const transactions = await dohvatiTransakcije(adresa);
    console.log(`Dohvaćeno ${transactions.length} transakcija za adresu`);
    
    // Vrati podatke u formatu koji aplikacija očekuje
    return {
      adresa: adresa,
      balance: balanceData.result,
      transactions: transactions
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju adrese:', error);
    throw error;
  }
}

async function dohvatiTransakciju(hash) {
  try {
    console.log(`Dohvaćam transakciju ${hash}...`);
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=tx&txhash=${hash}`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Dohvaćena transakcija:`, data);
    
    if (!data.result) {
      throw new Error('Transakcija nije pronađena');
    }
    
    const tx = data.result;
    
    // Dohvati dodatne informacije o bloku za timestamp
    const blockResponse = await fetch(`${ETHERSCAN_PROXY_URL}?action=block&blockno=${parseInt(tx.blockNumber, 16)}`);
    const blockData = await blockResponse.json();
    const timestamp = blockData.result && blockData.result.timestamp ? 
      new Date(parseInt(blockData.result.timestamp, 16) * 1000).toISOString() : 
      null;
    
    // Izračunaj vrijednost u USD
    const valueEth = parseInt(tx.value, 16) / 1e18;
    const valueUsd = valueEth * ethPrice.usd;
    
    // Transformiraj podatke u format koji aplikacija očekuje
    return {
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber, 16),
      blockTimestamp: timestamp,
      from: tx.from,
      to: tx.to,
      value: valueEth.toFixed(6), // Konverzija iz wei u ETH
      valueUsd: valueUsd.toFixed(2), // Vrijednost u USD
      gas: parseInt(tx.gas, 16),
      gasPrice: parseInt(tx.gasPrice, 16)
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcije:', error);
    return null;
  }
}

async function dohvatiBlok(brojBloka) {
  try {
    console.log(`Dohvaćam blok ${brojBloka}...`);
    const response = await fetch(`${ETHERSCAN_PROXY_URL}?action=block&blockno=${brojBloka}`);
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Dohvaćen blok ${brojBloka}:`, data);
    
    if (data.result) {
      return data.result;
    } else {
      console.error(`Neispravan format odgovora za blok ${brojBloka}:`, data);
      return null;
    }
  } catch (error) {
    console.error(`Greška pri dohvaćanju bloka ${brojBloka}:`, error);
    return null;
  }
}

// Funkcija za formatiranje vremena
function formatirajVrijeme(timestamp) {
  if (!timestamp) return "N/A";
  
  const datum = new Date(timestamp);
  return datum.toLocaleDateString("hr-HR") + " " + datum.toLocaleTimeString("hr-HR");
}

// Funkcija za skraćivanje hash vrijednosti
function skratiHash(hash) {
  if (!hash) return "N/A";
  return hash.substring(0, 6) + "..." + hash.substring(hash.length - 4);
}

// Funkcija za pretraživanje
async function pretrazi(upit) {
  try {
    console.log("Pretražujem:", upit);
    
    // Prikaži indikator učitavanja
    prikaziUcitavanje();
    
    // Provjeri je li upit prazan
    if (!upit || upit.trim() === "") {
      prikaziGresku("Unesite adresu, hash transakcije ili broj bloka za pretraživanje");
      return;
    }
    
    // Očisti upit
    upit = upit.trim();
    
    // Provjeri je li upit broj bloka
    if (/^\d+$/.test(upit)) {
      console.log("Upit je broj bloka");
      const blok = await dohvatiBlok(upit);
      if (blok) {
        prikaziBlok(blok);
      } else {
        prikaziGresku(`Blok broj ${upit} nije pronađen`);
      }
      return;
    }
    
    // Provjeri je li upit hash transakcije (0x + 64 heksadecimalna znaka)
    if (/^0x[a-fA-F0-9]{64}$/.test(upit)) {
      console.log("Upit je hash transakcije");
      const transakcija = await dohvatiTransakciju(upit);
      if (transakcija) {
        prikaziTransakciju(transakcija);
      } else {
        prikaziGresku(`Transakcija ${upit} nije pronađena`);
      }
      return;
    }
    
    // Provjeri je li upit Ethereum adresa (0x + 40 heksadecimalnih znakova)
    if (/^0x[a-fA-F0-9]{40}$/.test(upit)) {
      console.log("Upit je Ethereum adresa");
      try {
        const adresa = await dohvatiAdresu(upit);
        if (adresa) {
          prikaziAdresu(adresa);
        } else {
          prikaziGresku(`Adresa ${upit} nije pronađena`);
        }
      } catch (error) {
        prikaziGresku(`Greška pri dohvaćanju adrese: ${error.message}`);
      }
      return;
    }
    
    // Ako upit ne odgovara nijednom formatu, prikaži grešku
    prikaziGresku(`Neispravan format upita: ${upit}. Unesite valjanu Ethereum adresu, hash transakcije ili broj bloka.`);
  } catch (error) {
    console.error("Greška pri pretraživanju:", error);
    prikaziGresku(`Greška pri pretraživanju: ${error.message}`);
  }
}

// Funkcija za prikaz adrese
async function prikaziAdresu(adresa) {
  console.log("Prikazujem adresu:", adresa);
  
  if (!adresa || !adresa.adresa) {
    prikaziGresku("Neispravan format adrese");
    return;
  }
  
  // Formatiraj stanje računa
  const stanjeETH = parseFloat(adresa.balance) / 1e18;
  
  // Generiraj HTML za prikaz adrese
  let html = `
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-700">
        <h2 class="text-xl font-semibold text-white">Adresa</h2>
        <p class="text-gray-300 break-all mt-2">${adresa.adresa}</p>
      </div>
      <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between mb-6">
          <div class="mb-4 md:mb-0">
            <h3 class="text-lg font-semibold text-white">Stanje</h3>
            <p class="text-2xl font-bold text-green-400">${stanjeETH.toLocaleString('hr-HR', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} ETH</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Broj transakcija</h3>
            <p class="text-2xl font-bold text-blue-400">${adresa.transactions.length}</p>
          </div>
        </div>
        
        <!-- Tabovi za ETH i token transakcije -->
        <div class="mb-4 border-b border-gray-700">
          <div class="flex">
            <button id="eth-tab" class="px-4 py-2 tab-active">ETH Transakcije</button>
            <button id="token-tab" class="px-4 py-2 tab-inactive">Token Transakcije</button>
          </div>
        </div>
        
        <!-- Sadržaj ETH transakcija -->
        <div id="eth-transactions" class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="table-header">
              <tr>
                <th class="px-4 py-2 text-left text-white">Hash</th>
                <th class="px-4 py-2 text-left text-white">Blok</th>
                <th class="px-4 py-2 text-left text-white">Vrijeme</th>
                <th class="px-4 py-2 text-left text-white">Od</th>
                <th class="px-4 py-2 text-left text-white">Za</th>
                <th class="px-4 py-2 text-left text-white">Vrijednost (ETH)</th>
                <th class="px-4 py-2 text-left text-white">Status</th>
              </tr>
            </thead>
            <tbody>
  `;
  
  // Dodaj redove za transakcije
  if (adresa.transactions.length === 0) {
    html += `
      <tr class="table-row">
        <td colspan="7" class="px-4 py-2 text-center text-gray-400">Nema transakcija za ovu adresu</td>
      </tr>
    `;
  } else {
    adresa.transactions.forEach(tx => {
      const vrijednost = parseFloat(tx.value) / 1e18;
      const jePrimatelj = tx.to.toLowerCase() === adresa.adresa.toLowerCase();
      const jePoSiljatelj = tx.from.toLowerCase() === adresa.adresa.toLowerCase();
      
      html += `
        <tr class="table-row">
          <td class="px-4 py-2 text-blue-400">
            <a href="#" class="text-blue-400 hover:text-blue-300" onclick="pretrazi('${tx.hash}')" >${skratiHash(tx.hash)}</a>
          </td>
          <td class="px-4 py-2 text-gray-300">
            <a href="#" class="text-blue-400 hover:text-blue-300" onclick="pretrazi('${tx.blockNumber}')" >${tx.blockNumber}</a>
          </td>
          <td class="px-4 py-2 text-gray-300">${formatirajVrijeme(tx.timeStamp)}</td>
          <td class="px-4 py-2 ${jePoSiljatelj ? 'text-yellow-400 font-semibold' : 'text-gray-300'}">
            <a href="#" class="hover:text-blue-300" onclick="pretrazi('${tx.from}')">${skratiHash(tx.from)}</a>
          </td>
          <td class="px-4 py-2 ${jePrimatelj ? 'text-green-400 font-semibold' : 'text-gray-300'}">
            <a href="#" class="hover:text-blue-300" onclick="pretrazi('${tx.to}')">${skratiHash(tx.to)}</a>
          </td>
          <td class="px-4 py-2 ${jePrimatelj ? 'text-green-400' : 'text-red-400'}">${vrijednost.toLocaleString('hr-HR', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</td>
          <td class="px-4 py-2 ${tx.isError === "0" ? 'text-green-400' : 'text-red-400'}">${tx.isError === "0" ? 'Uspješno' : 'Neuspješno'}</td>
        </tr>
      `;
    });
  }
  
  html += `
            </tbody>
          </table>
        </div>
        
        <!-- Sadržaj token transakcija -->
        <div id="token-transactions" class="overflow-x-auto" style="display: none;">
          <table class="min-w-full">
            <thead class="table-header">
              <tr>
                <th class="px-4 py-2 text-left text-white">Hash</th>
                <th class="px-4 py-2 text-left text-white">Token</th>
                <th class="px-4 py-2 text-left text-white">Vrijeme</th>
                <th class="px-4 py-2 text-left text-white">Od</th>
                <th class="px-4 py-2 text-left text-white">Za</th>
                <th class="px-4 py-2 text-left text-white">Vrijednost</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row">
                <td colspan="6" class="px-4 py-2 text-center text-gray-400">Učitavanje token transakcija...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  // Prikaži rezultat
  const rezultatDiv = document.getElementById("rezultat-pretrage");
  rezultatDiv.innerHTML = html;
  rezultatDiv.style.display = "block";
  
  // Dodaj event listenere za tabove
  document.getElementById('eth-tab').addEventListener('click', function() {
    document.getElementById('eth-tab').classList.add('tab-active');
    document.getElementById('eth-tab').classList.remove('tab-inactive');
    document.getElementById('token-tab').classList.add('tab-inactive');
    document.getElementById('token-tab').classList.remove('tab-active');
    document.getElementById('eth-transactions').style.display = 'block';
    document.getElementById('token-transactions').style.display = 'none';
  });
  
  document.getElementById('token-tab').addEventListener('click', function() {
    document.getElementById('token-tab').classList.add('tab-active');
    document.getElementById('token-tab').classList.remove('tab-inactive');
    document.getElementById('eth-tab').classList.add('tab-inactive');
    document.getElementById('eth-tab').classList.remove('tab-active');
    document.getElementById('eth-transactions').style.display = 'none';
    document.getElementById('token-transactions').style.display = 'block';
    
    // Dohvati token transakcije ako još nisu dohvaćene
    if (document.querySelector('#token-transactions tbody tr td').textContent.includes('Učitavanje')) {
      dohvatiTokenTransakcije(adresa.adresa).then(tokenTransakcije => {
        prikaziTokenTransakcije(tokenTransakcije);
      }).catch(error => {
        document.querySelector('#token-transactions tbody').innerHTML = `
          <tr class="table-row">
            <td colspan="6" class="px-4 py-2 text-center text-red-400">Greška pri dohvaćanju token transakcija: ${error.message}</td>
          </tr>
        `;
      });
    }
  });
  
  // Vizualiziraj transakcije
  vizualizirajTransakcije(adresa.transactions);
}

// Funkcija za prikaz transakcije
async function prikaziTransakciju(transakcija) {
  console.log("Prikazujem transakciju:", transakcija);
  
  if (!transakcija) {
    prikaziGresku("Transakcija nije pronađena");
    return;
  }
  
  // Pripremi HTML za prikaz transakcije
  const rezultatDiv = document.getElementById("rezultat-pretrage");
  
  // Dohvati dodatne informacije o bloku za timestamp
  const blockResponse = await fetch(`${ETHERSCAN_PROXY_URL}?action=block&blockno=${parseInt(transakcija.blockNumber, 16)}`);
  const blockData = await blockResponse.json();
  const timestamp = blockData.result && blockData.result.timestamp ? 
    new Date(parseInt(blockData.result.timestamp, 16) * 1000).toISOString() : 
    null;
  
  // Izračunaj vrijednost u USD
  const valueEth = parseInt(transakcija.value, 16) / 1e18;
  const valueUsd = valueEth * ethPrice.usd;
  
  // Prikaži rezultat
  rezultatDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-white mb-4">Detalji transakcije</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-400">Hash transakcije:</p>
          <p class="text-white break-all">${transakcija.hash}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Blok:</p>
          <p class="text-white">${transakcija.blockNumber}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-400">Vrijeme:</p>
          <p class="text-white">${formatirajVrijeme(timestamp)}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Vrijednost:</p>
          <p class="text-white">${valueEth.toFixed(6)} ETH ($${valueUsd.toFixed(2)})</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-400">Od:</p>
          <p class="text-white break-all">${transakcija.from}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Do:</p>
          <p class="text-white break-all">${transakcija.to}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-400">Gas:</p>
          <p class="text-white">${transakcija.gas}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Gas cijena:</p>
          <p class="text-white">${(transakcija.gasPrice / 1e9).toFixed(2)} Gwei</p>
        </div>
      </div>
    </div>
  `;
  rezultatDiv.style.display = "block";
}

// Funkcija za prikaz bloka
async function prikaziBlok(blok) {
  console.log("Prikazujem blok:", blok);
  
  if (!blok) {
    prikaziGresku("Blok nije pronađen");
    return;
  }
  
  // Pripremi HTML za prikaz bloka
  const rezultatDiv = document.getElementById("rezultat-pretrage");
  
  // Dohvati transakcije za ovaj blok (samo prvih 10)
  const transakcije = await Promise.all(
    blok.transactions.slice(0, 10).map(hash => dohvatiTransakciju(hash))
  );
  
  let transakcijeHTML = "";
  transakcije.forEach((tx) => {
    if (!tx) return; // Preskoči ako transakcija nije pronađena
    
    transakcijeHTML += `
      <tr class="table-row">
        <td class="px-4 py-3 text-sm text-blue-400">${skratiHash(tx.hash)}</td>
        <td class="px-4 py-3 text-sm">${skratiHash(tx.from)}</td>
        <td class="px-4 py-3 text-sm">${skratiHash(tx.to)}</td>
        <td class="px-4 py-3 text-sm">${tx.value} ETH</td>
        <td class="px-4 py-3 text-sm">$${tx.valueUsd}</td>
      </tr>
    `;
  });

  // Prikaži rezultat
  rezultatDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-white mb-4">Detalji bloka</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-400">Broj bloka:</p>
          <p class="text-white">${blok.number}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Vrijeme:</p>
          <p class="text-white">${formatirajVrijeme(blok.timestamp)}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-gray-400">Hash bloka:</p>
          <p class="text-white break-all">${blok.hash}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Rudar:</p>
          <p class="text-white break-all">${blok.miner}</p>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold text-white mb-2">Transakcije u bloku</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="table-header">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Od</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Do</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ETH</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">USD</th>
              </tr>
            </thead>
            <tbody>
              ${transakcijeHTML}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  rezultatDiv.style.display = "block";
}

// Funkcija za formatiranje vremena
function formatirajVrijeme(timestamp) {
  if (!timestamp) return "N/A";
  
  const datum = new Date(timestamp);
  return datum.toLocaleDateString("hr-HR") + " " + datum.toLocaleTimeString("hr-HR");
}

// Funkcija za skraćivanje hash vrijednosti
function skratiHash(hash) {
  if (!hash) return "N/A";
  return hash.substring(0, 6) + "..." + hash.substring(hash.length - 4);
}

// Funkcija za pretraživanje
async function pretrazi(upit) {
  try {
    console.log("Pretražujem:", upit);
    
    // Prikaži indikator učitavanja
    prikaziUcitavanje();
    
    // Provjeri je li upit prazan
    if (!upit || upit.trim() === "") {
      prikaziGresku("Unesite adresu, hash transakcije ili broj bloka za pretraživanje");
      return;
    }
    
    // Očisti upit
    upit = upit.trim();
    
    // Provjeri je li upit broj bloka
    if (/^\d+$/.test(upit)) {
      console.log("Upit je broj bloka");
      const blok = await dohvatiBlok(upit);
      if (blok) {
        prikaziBlok(blok);
      } else {
        prikaziGresku(`Blok broj ${upit} nije pronađen`);
      }
      return;
    }
    
    // Provjeri je li upit hash transakcije (0x + 64 heksadecimalna znaka)
    if (/^0x[a-fA-F0-9]{64}$/.test(upit)) {
      console.log("Upit je hash transakcije");
      const transakcija = await dohvatiTransakciju(upit);
      if (transakcija) {
        prikaziTransakciju(transakcija);
      } else {
        prikaziGresku(`Transakcija ${upit} nije pronađena`);
      }
      return;
    }
    
    // Provjeri je li upit Ethereum adresa (0x + 40 heksadecimalnih znakova)
    if (/^0x[a-fA-F0-9]{40}$/.test(upit)) {
      console.log("Upit je Ethereum adresa");
      try {
        const adresa = await dohvatiAdresu(upit);
        if (adresa) {
          prikaziAdresu(adresa);
        } else {
          prikaziGresku(`Adresa ${upit} nije pronađena`);
        }
      } catch (error) {
        prikaziGresku(`Greška pri dohvaćanju adrese: ${error.message}`);
      }
      return;
    }
    
    // Ako upit ne odgovara nijednom formatu, prikaži grešku
    prikaziGresku(`Neispravan format upita: ${upit}. Unesite valjanu Ethereum adresu, hash transakcije ili broj bloka.`);
  } catch (error) {
    console.error("Greška pri pretraživanju:", error);
    prikaziGresku(`Greška pri pretraživanju: ${error.message}`);
  }
}

// Funkcija za pripremu podataka za vizualizaciju transakcija
function pripremiPodatkeZaVizualizaciju(transakcije) {
  // Filtriraj samo uspješne transakcije
  const filtrirane = transakcije.filter(tx => tx.isError === "0");
  
  // Sortiraj transakcije po vremenskom redoslijedu (od najstarije do najnovije)
  const sortirane = filtrirane.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
  
  // Pripremi čvorove (adrese) i veze (transakcije)
  const nodes = new Set();
  const links = [];
  
  // Dodaj trenutnu adresu kao početni čvor
  const trenutnaAdresa = sortirane.length > 0 ? 
    (sortirane[0].from.toLowerCase() === sortirane[0].to.toLowerCase() ? 
      sortirane[0].from : sortirane[0].from) : '';
  
  nodes.add(trenutnaAdresa);
  
  // Dodaj sve jedinstvene adrese kao čvorove
  sortirane.forEach(tx => {
    nodes.add(tx.from);
    nodes.add(tx.to);
    
    links.push({
      source: tx.from,
      target: tx.to,
      value: parseFloat(tx.value) / 1e18, // Vrijednost u ETH
      hash: tx.hash,
      timestamp: tx.timeStamp,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      blockNumber: tx.blockNumber
    });
  });
  
  // Pretvori set u polje objekata
  const nodeArray = Array.from(nodes).map(adresa => ({
    id: adresa,
    isCurrentAddress: adresa.toLowerCase() === trenutnaAdresa.toLowerCase()
  }));
  
  return {
    nodes: nodeArray,
    links: links
  };
}

// Funkcija za vizualizaciju transakcija
function vizualizirajTransakcije(transakcije) {
  // Pripremi podatke za vizualizaciju
  const data = pripremiPodatkeZaVizualizaciju(transakcije);
  
  // Ako nema podataka, sakrij kontejner i izađi
  if (data.nodes.length === 0 || data.links.length === 0) {
    document.getElementById('transaction-graph-container').style.display = 'none';
    return;
  }
  
  // Prikaži kontejner
  document.getElementById('transaction-graph-container').style.display = 'block';
  
  // Očisti prethodni graf
  const container = document.getElementById('transaction-graph');
  container.innerHTML = '';
  
  // Postavi dimenzije
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Kreiraj SVG element
  const svg = d3.select('#transaction-graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  // Dodaj definicije za strelice
  const defs = svg.append('defs');
  
  // Zelena strelica za dolazne transakcije
  defs.append('marker')
    .attr('id', 'arrowhead-green')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 5)
    .attr('markerHeight', 5)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10,0 L 0,5')
    .attr('fill', '#10b981')
    .style('stroke', 'none');
  
  // Crvena strelica za odlazne transakcije
  defs.append('marker')
    .attr('id', 'arrowhead-red')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 5)
    .attr('markerHeight', 5)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10,0 L 0,5')
    .attr('fill', '#ef4444')
    .style('stroke', 'none');
  
  // Kreiraj tooltip
  const tooltip = d3.select('#tooltip');
  
  // Kreiraj simulaciju
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links).id(d => d.id).distance(250))
    .force('charge', d3.forceManyBody().strength(-800))
    .force('center', d3.forceCenter(width / 2, height / 2));
  
  // Kreiraj veze
  const link = svg.append('g')
    .selectAll('line')
    .data(data.links)
    .enter()
    .append('line')
    .attr('class', d => {
      // Odredi je li transakcija dolazna ili odlazna u odnosu na trenutnu adresu
      const trenutnaAdresa = data.nodes.find(n => n.isCurrentAddress).id.toLowerCase();
      return d.source.id.toLowerCase() === trenutnaAdresa ? 'link-outgoing' : 'link-incoming';
    })
    .attr('stroke-width', d => Math.max(1, Math.min(5, Math.sqrt(d.value) * 2)))
    .attr('marker-end', d => {
      // Odredi je li transakcija dolazna ili odlazna u odnosu na trenutnu adresu
      const trenutnaAdresa = data.nodes.find(n => n.isCurrentAddress).id.toLowerCase();
      return d.source.id.toLowerCase() === trenutnaAdresa ? 'url(#arrowhead-red)' : 'url(#arrowhead-green)';
    })
    .on('mouseover', function(event, d) {
      // Prikaži tooltip s detaljima transakcije
      tooltip.style('opacity', 1)
        .html(`
          <div class="tooltip-title">Detalji transakcije</div>
          <div class="tooltip-row">
            <span class="tooltip-label">Hash:</span>
            <span class="tooltip-value">${skratiHash(d.hash)}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Od:</span>
            <span class="tooltip-value">${skratiHash(d.source.id)}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Za:</span>
            <span class="tooltip-value">${skratiHash(d.target.id)}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Vrijednost:</span>
            <span class="tooltip-value">${d.value.toFixed(6)} ETH</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Vrijeme:</span>
            <span class="tooltip-value">${formatirajVrijeme(d.timestamp)}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Blok:</span>
            <span class="tooltip-value">${d.blockNumber}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Gas potrošen:</span>
            <span class="tooltip-value">${d.gas} jedinica</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Gas cijena:</span>
            <span class="tooltip-value">${(d.gasPrice / 1e9).toFixed(2)} Gwei</span>
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      // Sakrij tooltip
      tooltip.style('opacity', 0);
    });
  
  // Kreiraj čvorove
  const node = svg.append('g')
    .selectAll('circle')
    .data(data.nodes)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('r', d => d.isCurrentAddress ? 15 : 8)
    .attr('fill', d => d.isCurrentAddress ? '#3b82f6' : '#6b7280')
    .on('mouseover', function(event, d) {
      // Dohvati sve transakcije povezane s ovom adresom
      const povezaneTransakcije = data.links.filter(link => 
        link.source.id === d.id || link.target.id === d.id
      );
      
      // Izračunaj ukupno poslano i primljeno
      let ukupnoPoslano = 0;
      let ukupnoPrimljeno = 0;
      let ukupnoTransakcija = povezaneTransakcije.length;
      
      povezaneTransakcije.forEach(tx => {
        if (tx.source.id === d.id) {
          ukupnoPoslano += tx.value;
        } else {
          ukupnoPrimljeno += tx.value;
        }
      });
      
      // Prikaži tooltip s detaljima adrese
      tooltip.style('opacity', 1)
        .html(`
          <div class="tooltip-title">${d.isCurrentAddress ? 'Trenutna adresa' : 'Povezana adresa'}</div>
          <div class="tooltip-row">
            <span class="tooltip-label">Adresa:</span>
            <span class="tooltip-value">${d.id}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Ukupno transakcija:</span>
            <span class="tooltip-value">${ukupnoTransakcija}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Ukupno poslano:</span>
            <span class="tooltip-value">${ukupnoPoslano.toFixed(6)} ETH</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Ukupno primljeno:</span>
            <span class="tooltip-value">${ukupnoPrimljeno.toFixed(6)} ETH</span>
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      // Sakrij tooltip
      tooltip.style('opacity', 0);
    })
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));
  
  // Dodaj oznake za čvorove
  const labels = svg.append('g')
    .selectAll('text')
    .data(data.nodes)
    .enter()
    .append('text')
    .text(d => skratiHash(d.id))
    .attr('font-size', '11px')
    .attr('dx', 12)
    .attr('dy', 4)
    .attr('fill', '#fff');
  
  // Funkcije za povlačenje čvorova
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  // Ažuriraj pozicije elemenata tijekom simulacije
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    
    labels
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });
}

// Funkcija za prikaz indikatora učitavanja
function prikaziUcitavanje() {
  const rezultatDiv = document.getElementById("rezultat-pretrage");
  rezultatDiv.innerHTML = `
    <div class="flex justify-center items-center p-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p class="ml-4 text-white">Učitavanje podataka...</p>
    </div>
  `;
  rezultatDiv.style.display = "block";
}

// Funkcija za prikaz greške
function prikaziGresku(poruka) {
  console.error("Greška:", poruka);
  
  const rezultatDiv = document.getElementById("rezultat-pretrage");
  rezultatDiv.innerHTML = `
    <div class="bg-red-800 text-white p-4 rounded-lg shadow-lg mt-4">
      <p class="font-semibold">Greška</p>
      <p>${poruka}</p>
    </div>
  `;
  rezultatDiv.style.display = "block";
}

// Inicijalizacija nakon učitavanja stranice
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM učitan, inicijaliziram tražilicu...");
  
  // Inicijaliziraj tražilicu
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  
  if (searchInput && searchButton) {
    // Dodaj event listener za klik na gumb za pretraživanje
    searchButton.addEventListener("click", function () {
      const upit = searchInput.value.trim();
      if (upit) {
        pretrazi(upit);
      }
    });
    
    // Dodaj event listener za pritisak tipke Enter u polju za pretraživanje
    searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const upit = searchInput.value.trim();
        if (upit) {
          pretrazi(upit);
        }
      }
    });
    
    console.log("Tražilica inicijalizirana.");
  } else {
    console.error("Nedostaju elementi za tražilicu!");
  }
  
  // Dohvati početne podatke
  dohvatiCijenuEthereuma();
  dohvatiGasInfo();
  dohvatiZadnjeBlokove();
  dohvatiStatistikuMreze();
  
  console.log("Dohvaćanje početnih podataka pokrenuto.");
});
