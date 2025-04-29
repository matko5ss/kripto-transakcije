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
    console.log(`Dohvaćeni podaci:`, data);
    
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
      value: (parseFloat(tx.value) / 1e18).toFixed(6), // Konverzija iz wei u ETH
      valueUsd: ((parseFloat(tx.value) / 1e18) * ethPrice.usd).toFixed(2), // Vrijednost u USD
      gas: tx.gas,
      gasPrice: tx.gasPrice
    }));
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
      throw new Error(`API greška kod dohvaćanja stanja: ${balanceResponse.status}`);
    }
    
    const balanceData = await balanceResponse.json();
    console.log(`Dohvaćeni podaci za stanje adrese:`, balanceData);
    
    if (balanceData.status !== "1") {
      throw new Error(`API greška: ${balanceData.message}`);
    }
    
    // Izračunaj vrijednost u USD
    const balanceEth = parseFloat(balanceData.result) / 1e18;
    const balanceUsd = balanceEth * ethPrice.usd;
    
    // Dohvati transakcije za ovu adresu
    const transakcije = await dohvatiTransakcije(adresa);
    console.log(`Dohvaćeno ${transakcije.length} transakcija za adresu`);
    
    // Vrati podatke u formatu koji aplikacija očekuje
    return {
      adresa: adresa,
      balance: balanceEth.toFixed(6), // Konverzija iz wei u ETH
      balanceUsd: balanceUsd.toFixed(2), // Vrijednost u USD
      transactions: transakcije.map(tx => tx.hash)
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka adrese:', error);
    return null;
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
  console.log("Funkcija pretrazi pozvana s upitom:", upit);
  
  try {
    // Prikaži indikator učitavanja
    prikaziUcitavanje();
    
    // Provjera je li upit prazan
    if (!upit || upit.trim() === '') {
      prikaziGresku('Unesite adresu, hash transakcije ili broj bloka za pretraživanje');
      return;
    }
    
    // Čišćenje upita
    upit = upit.trim().toLowerCase();
    console.log("Očišćeni upit:", upit);
    
    // Provjera je li upit adresa (0x...)
    if (upit.startsWith('0x') && upit.length >= 40) {
      console.log("Upit prepoznat kao Ethereum adresa");
      
      try {
        // Dohvati podatke za adresu
        const adresa = await dohvatiAdresu(upit);
        
        if (adresa) {
          console.log("Adresa pronađena:", adresa);
          prikaziAdresu(adresa);
        } else {
          console.log("Adresa nije pronađena");
          prikaziGresku("Adresa nije pronađena");
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju adrese:", error);
        prikaziGresku("Greška pri dohvaćanju podataka adrese: " + error.message);
      }
      return;
    }
    
    // Provjera je li upit hash transakcije (0x...)
    if (upit.startsWith("0x") && upit.length >= 60) {
      try {
        // Dohvati transakciju
        const transakcija = await dohvatiTransakciju(upit);
        
        if (transakcija) {
          prikaziTransakciju(transakcija);
        } else {
          prikaziGresku("Transakcija nije pronađena");
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju transakcije:", error);
        prikaziGresku("Greška pri dohvaćanju transakcije: " + error.message);
      }
      return;
    }
    
    // Provjera je li upit broj bloka
    if (/^\d+$/.test(upit)) {
      try {
        // Dohvati blok
        const blok = await dohvatiBlok(upit);
        
        if (blok) {
          prikaziBlok(blok);
        } else {
          prikaziGresku("Blok nije pronađen");
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju bloka:", error);
        prikaziGresku("Greška pri dohvaćanju bloka: " + error.message);
      }
      return;
    }
    
    // Ako upit ne odgovara nijednom formatu
    prikaziGresku("Nevažeći format upita. Unesite adresu, hash transakcije ili broj bloka.");
  } catch (error) {
    console.error("Neočekivana greška u funkciji pretrazi:", error);
    prikaziGresku("Neočekivana greška: " + error.message);
  }
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

// Funkcija za prikaz adrese
async function prikaziAdresu(adresa) {
  console.log("Prikazujem adresu:", adresa);
  
  // Pripremi HTML za prikaz adrese
  const rezultatDiv = document.getElementById("rezultat-pretrage");

  // Dohvati stvarne transakcije za ovu adresu
  const transakcije = await dohvatiTransakcije(adresa.adresa);
  console.log("Dohvaćene transakcije za adresu:", transakcije);

  let transakcijeHTML = "";
  transakcije.forEach((tx) => {
    transakcijeHTML += `
      <tr class="table-row">
        <td class="px-4 py-3 text-sm text-blue-400">${skratiHash(tx.hash)}</td>
        <td class="px-4 py-3 text-sm">
          ${formatirajVrijeme(tx.blockTimestamp)}
        </td>
        <td class="px-4 py-3 text-sm">
          ${
            tx.from.toLowerCase() === adresa.adresa.toLowerCase()
              ? `<span class="text-red-400">OUT</span>`
              : `<span class="text-green-400">IN</span>`
          }
        </td>
        <td class="px-4 py-3 text-sm">
          ${
            tx.from.toLowerCase() === adresa.adresa.toLowerCase()
              ? skratiHash(tx.to)
              : skratiHash(tx.from)
          }
        </td>
        <td class="px-4 py-3 text-sm">${tx.value} ETH</td>
        <td class="px-4 py-3 text-sm">$${tx.valueUsd}</td>
      </tr>
    `;
  });

  // Prikaži rezultat
  rezultatDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-white mb-4">Detalji adrese</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-gray-400">Adresa:</p>
          <p class="text-white break-all">${adresa.adresa}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Stanje:</p>
          <p class="text-white">${adresa.balance} ETH ($${adresa.balanceUsd})</p>
        </div>
      </div>
      
      <!-- Tabovi za različite vrste transakcija -->
      <div class="mb-4">
        <div class="flex border-b border-gray-700">
          <button class="px-4 py-2 text-white font-medium border-b-2 border-blue-500" id="tab-eth">ETH Transakcije</button>
          <button class="px-4 py-2 text-gray-400 font-medium" id="tab-tokens">Token Transakcije</button>
        </div>
      </div>
      
      <!-- ETH transakcije -->
      <div id="eth-transactions">
        <h3 class="text-lg font-semibold text-white mb-2">ETH Transakcije</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="table-header">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijeme</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tip</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresa</th>
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
      
      <!-- Token transakcije -->
      <div id="token-transactions" style="display: none;">
        <h3 class="text-lg font-semibold text-white mb-2">Token Transakcije</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="table-header">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijeme</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Od</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Do</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijednost</th>
              </tr>
            </thead>
            <tbody id="token-transakcije">
              <!-- Token transakcije će biti prikazane ovdje -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  // Dodaj event listenere za tabove
  document.getElementById('tab-eth').addEventListener('click', function() {
    document.getElementById('eth-transactions').style.display = 'block';
    document.getElementById('token-transactions').style.display = 'none';
    document.getElementById('tab-eth').classList.add('border-blue-500');
    document.getElementById('tab-eth').classList.remove('text-gray-400');
    document.getElementById('tab-eth').classList.add('text-white');
    document.getElementById('tab-tokens').classList.remove('border-blue-500');
    document.getElementById('tab-tokens').classList.add('text-gray-400');
    document.getElementById('tab-tokens').classList.remove('text-white');
  });
  
  document.getElementById('tab-tokens').addEventListener('click', function() {
    document.getElementById('eth-transactions').style.display = 'none';
    document.getElementById('token-transactions').style.display = 'block';
    document.getElementById('tab-eth').classList.remove('border-blue-500');
    document.getElementById('tab-eth').classList.add('text-gray-400');
    document.getElementById('tab-eth').classList.remove('text-white');
    document.getElementById('tab-tokens').classList.add('border-blue-500');
    document.getElementById('tab-tokens').classList.remove('text-gray-400');
    document.getElementById('tab-tokens').classList.add('text-white');
  });
  
  rezultatDiv.style.display = "block";
  
  // Prikaži token transakcije
  prikaziTokenTransakcije();
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
          <p class="text-white">${formatirajVrijeme(transakcija.blockTimestamp)}</p>
        </div>
        
        <div>
          <p class="text-gray-400">Vrijednost:</p>
          <p class="text-white">${transakcija.value} ETH ($${transakcija.valueUsd})</p>
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
