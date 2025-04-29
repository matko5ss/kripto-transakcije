// app.js - Glavna JavaScript datoteka za Kripto Transakcije aplikaciju

// Konfiguracija za API pozive
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUyNTgyN2I2LTVmYzQtNGJiMS04YzZiLWZkMTFhNTMyZTgwOCIsIm9yZ0lkIjoiNDQ0NDE1IiwidXNlcklkIjoiNDU3MjQ1IiwidHlwZUlkIjoiNDIxZDliYWYtZmQzZS00MWNjLWI2YmMtYzRjMDQzOGMzNTM5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDU5MTc1MDAsImV4cCI6NDkwMTY3NzUwMH0.33JOk4pd2Acz-aIt8kwBqnvgZ2IXf9fHpAK0o6AujOk';
const MORALIS_BASE_URL = 'https://deep-index.moralis.io/api/v2';
const CORS_PROXY = 'https://corsproxy.io/?';
const API_PROXY_URL = `${CORS_PROXY}${encodeURIComponent(MORALIS_BASE_URL)}`;

// Funkcije za API pozive
async function dohvatiTransakcije(adresa, limit = 10) {
  try {
    console.log(`Dohvaćam transakcije za adresu ${adresa}...`);
    
    const url = `${API_PROXY_URL}/${adresa}?chain=eth&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Dohvaćeno ${data.result.length} transakcija`);
    
    // Transformiraj podatke u format koji aplikacija očekuje
    return data.result.map(tx => ({
      hash: tx.hash,
      blockNumber: tx.block_number,
      blockTimestamp: tx.block_timestamp,
      from: tx.from_address,
      to: tx.to_address,
      value: (parseFloat(tx.value) / 1e18).toFixed(6), // Konverzija iz wei u ETH
      gas: tx.gas,
      gasPrice: tx.gas_price
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
    const url = `${API_PROXY_URL}/${adresa}/balance?chain=eth`;
    
    const balanceResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!balanceResponse.ok) {
      throw new Error(`API greška kod dohvaćanja stanja: ${balanceResponse.status}`);
    }
    
    const balanceData = await balanceResponse.json();
    console.log(`Dohvaćeni podaci za stanje adrese:`, balanceData);
    
    // Dohvati transakcije za ovu adresu
    const transakcije = await dohvatiTransakcije(adresa, 20);
    console.log(`Dohvaćeno ${transakcije.length} transakcija za adresu`);
    
    // Vrati podatke u formatu koji aplikacija očekuje
    return {
      adresa: adresa,
      balance: (parseFloat(balanceData.balance) / 1e18).toFixed(6), // Konverzija iz wei u ETH
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
    
    const url = `${API_PROXY_URL}/transaction/${hash}?chain=eth`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const tx = await response.json();
    console.log(`Dohvaćena transakcija:`, tx);
    
    // Transformiraj podatke u format koji aplikacija očekuje
    return {
      hash: tx.hash,
      blockNumber: tx.block_number,
      blockTimestamp: tx.block_timestamp,
      from: tx.from_address,
      to: tx.to_address,
      value: (parseFloat(tx.value) / 1e18).toFixed(6), // Konverzija iz wei u ETH
      gas: tx.gas,
      gasPrice: tx.gas_price
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju transakcije:', error);
    return null;
  }
}

async function dohvatiBlok(brojBloka) {
  try {
    console.log(`Dohvaćam blok ${brojBloka}...`);
    
    const url = `${API_PROXY_URL}/block/${brojBloka}?chain=eth`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API greška: ${response.status}`);
    }
    
    const blok = await response.json();
    console.log(`Dohvaćen blok:`, blok);
    
    // Transformiraj podatke u format koji aplikacija očekuje
    return {
      number: blok.number,
      timestamp: blok.timestamp,
      hash: blok.hash,
      parentHash: blok.parent_hash,
      nonce: blok.nonce,
      difficulty: blok.difficulty,
      gasLimit: blok.gas_limit,
      gasUsed: blok.gas_used,
      miner: blok.miner,
      transactions: blok.transactions || []
    };
  } catch (error) {
    console.error('Greška pri dohvaćanju bloka:', error);
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
}

// Funkcija za prikaz adrese
async function prikaziAdresu(adresa) {
  console.log("Prikazujem adresu:", adresa);
  
  // Pripremi HTML za prikaz adrese
  const rezultatDiv = document.getElementById("rezultat-pretrage");

  // Dohvati stvarne transakcije za ovu adresu
  const transakcije = await dohvatiTransakcije(adresa.adresa, 20);
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
          <p class="text-white">${adresa.balance} ETH</p>
        </div>
      </div>
      
      <div>
        <h3 class="text-lg font-semibold text-white mb-2">Transakcije</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="table-header">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijeme</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tip</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresa</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijednost</th>
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
}

// Funkcija za prikaz transakcije
async function prikaziTransakciju(hash) {
  console.log("Prikazujem transakciju:", hash);
  
  // Dohvati transakciju putem API-ja
  const transakcija = await dohvatiTransakciju(hash);
  
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
          <p class="text-white">${transakcija.value} ETH</p>
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
          <p class="text-white">${(parseFloat(transakcija.gasPrice) / 1e9).toFixed(2)} Gwei</p>
        </div>
      </div>
    </div>
  `;
}

// Funkcija za prikaz bloka
async function prikaziBlok(brojBloka) {
  console.log("Prikazujem blok:", brojBloka);
  
  // Dohvati blok putem API-ja
  const blok = await dohvatiBlok(brojBloka);
  
  if (!blok) {
    prikaziGresku("Blok nije pronađen");
    return;
  }
  
  // Pripremi HTML za prikaz bloka
  const rezultatDiv = document.getElementById("rezultat-pretrage");

  // Dohvati transakcije za ovaj blok
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
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijednost</th>
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
}

// Inicijalizacija nakon učitavanja stranice
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM učitan, inicijaliziram tražilicu...");
  
  // Dohvati elemente za pretraživanje
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");
  
  if (!searchInput || !searchButton) {
    console.error("Elementi tražilice nisu pronađeni!");
    console.log("SearchInput:", searchInput);
    console.log("SearchButton:", searchButton);
    return;
  }
  
  console.log("Elementi tražilice pronađeni, dodajem event listenere...");
  
  // Event listener za klik na gumb za pretraživanje
  searchButton.addEventListener("click", function () {
    console.log("Pretraživanje pokrenuto klikom:", searchInput.value);
    pretrazi(searchInput.value);
  });

  // Event listener za pritisak Enter u polju za pretraživanje
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      console.log("Pretraživanje pokrenuto pritiskom Enter:", searchInput.value);
      e.preventDefault();
      pretrazi(searchInput.value);
    }
  });
  
  console.log("Event listeneri dodani, tražilica spremna.");
});
