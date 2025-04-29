// app.js - Glavna JavaScript datoteka za Kripto Transakcije aplikaciju

// Mock podaci za demonstraciju funkcionalnosti
const mockPodaci = {
  transakcije: [
    {
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111',
      blockNumber: '12345678',
      blockTimestamp: '2025-04-29T09:30:00.000Z',
      from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      value: '0.100000',
      gas: '21000',
      gasPrice: '25000000000'
    },
    {
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2222',
      blockNumber: '12345677',
      blockTimestamp: '2025-04-29T09:25:00.000Z',
      from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      value: '0.200000',
      gas: '21000',
      gasPrice: '25000000000'
    },
    {
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3333',
      blockNumber: '12345676',
      blockTimestamp: '2025-04-29T09:20:00.000Z',
      from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      value: '0.300000',
      gas: '21000',
      gasPrice: '25000000000'
    },
    {
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4444',
      blockNumber: '12345675',
      blockTimestamp: '2025-04-29T09:15:00.000Z',
      from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      value: '0.400000',
      gas: '21000',
      gasPrice: '25000000000'
    },
    {
      hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5555',
      blockNumber: '12345674',
      blockTimestamp: '2025-04-29T09:10:00.000Z',
      from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      value: '0.500000',
      gas: '21000',
      gasPrice: '25000000000'
    }
  ],
  blokovi: [
    {
      number: '12345678',
      timestamp: '2025-04-29T09:30:00.000Z',
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111']
    },
    {
      number: '12345677',
      timestamp: '2025-04-29T09:25:00.000Z',
      hash: '0x0000000000000000000000000000000000000000000000000000000000000002',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2222']
    },
    {
      number: '12345676',
      timestamp: '2025-04-29T09:20:00.000Z',
      hash: '0x0000000000000000000000000000000000000000000000000000000000000003',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3333']
    },
    {
      number: '12345675',
      timestamp: '2025-04-29T09:15:00.000Z',
      hash: '0x0000000000000000000000000000000000000000000000000000000000000004',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4444']
    },
    {
      number: '12345674',
      timestamp: '2025-04-29T09:10:00.000Z',
      hash: '0x0000000000000000000000000000000000000000000000000000000000000005',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5555']
    }
  ],
  adrese: [
    {
      adresa: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      balance: '10.5',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111', '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2222']
    },
    {
      adresa: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      balance: '5.2',
      transactions: ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111', '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2222']
    }
  ]
};

// Funkcija za formatiranje vremena
function formatirajVrijeme(timestamp) {
  const datum = new Date(timestamp);
  const sada = new Date();
  const razlikaMs = sada - datum;
  const razlikaSek = Math.floor(razlikaMs / 1000);
  
  if (razlikaSek < 60) return 'prije manje od minute';
  if (razlikaSek < 3600) return `prije ${Math.floor(razlikaSek / 60)} minuta`;
  if (razlikaSek < 86400) return `prije ${Math.floor(razlikaSek / 3600)} sati`;
  
  return `${datum.getDate()}.${datum.getMonth() + 1}.${datum.getFullYear()}.`;
}

// Funkcija za skraćivanje hash vrijednosti
function skratiHash(hash) {
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

// Funkcija za pretraživanje
function pretrazi(upit) {
  // Provjera je li upit prazan
  if (!upit || upit.trim() === '') {
    prikaziGresku('Unesite adresu, hash transakcije ili broj bloka za pretraživanje');
    return;
  }
  
  // Čišćenje upita
  upit = upit.trim().toLowerCase();
  
  // Provjera je li upit adresa (0x...)
  if (upit.startsWith('0x') && upit.length >= 40) {
    const adresa = mockPodaci.adrese.find(a => a.adresa.toLowerCase() === upit);
    if (adresa) {
      prikaziAdresu(adresa);
    } else {
      prikaziGresku('Adresa nije pronađena');
    }
    return;
  }
  
  // Provjera je li upit hash transakcije (0x...)
  if (upit.startsWith('0x') && upit.length >= 60) {
    const transakcija = mockPodaci.transakcije.find(t => t.hash.toLowerCase() === upit);
    if (transakcija) {
      prikaziTransakciju(transakcija);
    } else {
      prikaziGresku('Transakcija nije pronađena');
    }
    return;
  }
  
  // Provjera je li upit broj bloka
  if (/^\d+$/.test(upit)) {
    const blok = mockPodaci.blokovi.find(b => b.number === upit);
    if (blok) {
      prikaziBlok(blok);
    } else {
      prikaziGresku('Blok nije pronađen');
    }
    return;
  }
  
  // Ako ništa od navedenog
  prikaziGresku('Neispravan format upita. Unesite adresu, hash transakcije ili broj bloka.');
}

// Funkcija za prikaz greške
function prikaziGresku(poruka) {
  const rezultatDiv = document.getElementById('rezultat-pretrage');
  rezultatDiv.innerHTML = `
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
      <strong class="font-bold">Greška!</strong>
      <span class="block sm:inline"> ${poruka}</span>
    </div>
  `;
  rezultatDiv.style.display = 'block';
}

// Funkcija za prikaz adrese
function prikaziAdresu(adresa) {
  const rezultatDiv = document.getElementById('rezultat-pretrage');
  
  // Filtriraj transakcije za ovu adresu
  const adresaTransakcije = mockPodaci.transakcije.filter(t => 
    t.from.toLowerCase() === adresa.adresa.toLowerCase() || 
    t.to.toLowerCase() === adresa.adresa.toLowerCase()
  );
  
  let transakcijeHTML = '';
  adresaTransakcije.forEach(tx => {
    transakcijeHTML += `
      <tr class="table-row">
        <td class="px-4 py-3 text-sm text-blue-400">${skratiHash(tx.hash)}</td>
        <td class="px-4 py-3 text-sm text-gray-300">${tx.blockNumber}</td>
        <td class="px-4 py-3 text-sm text-gray-400">${formatirajVrijeme(tx.blockTimestamp)}</td>
        <td class="px-4 py-3 text-sm text-gray-300">${skratiHash(tx.from)}</td>
        <td class="px-4 py-3 text-sm text-gray-300">${skratiHash(tx.to)}</td>
        <td class="px-4 py-3 text-sm text-green-400">${tx.value} ETH</td>
      </tr>
    `;
  });
  
  rezultatDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-4">
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-lg font-semibold text-white">Detalji adrese</h2>
      </div>
      
      <div class="p-4">
        <div class="mb-4">
          <p class="text-gray-400">Adresa:</p>
          <p class="text-white break-all">${adresa.adresa}</p>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-400">Stanje:</p>
          <p class="text-white">${adresa.balance} ETH</p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-white mb-2">Transakcije</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="table-header">
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hash</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Blok</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijeme</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Od</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Do</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vrijednost</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${transakcijeHTML}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  rezultatDiv.style.display = 'block';
}

// Funkcija za prikaz transakcije
function prikaziTransakciju(transakcija) {
  const rezultatDiv = document.getElementById('rezultat-pretrage');
  
  rezultatDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-4">
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-lg font-semibold text-white">Detalji transakcije</h2>
      </div>
      
      <div class="p-4">
        <div class="mb-4">
          <p class="text-gray-400">Hash transakcije:</p>
          <p class="text-white break-all">${transakcija.hash}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-gray-400">Blok:</p>
            <p class="text-white">${transakcija.blockNumber}</p>
          </div>
          
          <div>
            <p class="text-gray-400">Vrijeme:</p>
            <p class="text-white">${formatirajVrijeme(transakcija.blockTimestamp)}</p>
          </div>
          
          <div>
            <p class="text-gray-400">Od:</p>
            <p class="text-white break-all">${transakcija.from}</p>
          </div>
          
          <div>
            <p class="text-gray-400">Do:</p>
            <p class="text-white break-all">${transakcija.to}</p>
          </div>
          
          <div>
            <p class="text-gray-400">Vrijednost:</p>
            <p class="text-white">${transakcija.value} ETH</p>
          </div>
          
          <div>
            <p class="text-gray-400">Gas cijena:</p>
            <p class="text-white">${parseInt(transakcija.gasPrice) / 1000000000} Gwei</p>
          </div>
          
          <div>
            <p class="text-gray-400">Gas limit:</p>
            <p class="text-white">${transakcija.gas}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  rezultatDiv.style.display = 'block';
}

// Funkcija za prikaz bloka
function prikaziBlok(blok) {
  const rezultatDiv = document.getElementById('rezultat-pretrage');
  
  // Filtriraj transakcije za ovaj blok
  const blokTransakcije = mockPodaci.transakcije.filter(t => t.blockNumber === blok.number);
  
  let transakcijeHTML = '';
  blokTransakcije.forEach(tx => {
    transakcijeHTML += `
      <tr class="table-row">
        <td class="px-4 py-3 text-sm text-blue-400">${skratiHash(tx.hash)}</td>
        <td class="px-4 py-3 text-sm text-gray-300">${skratiHash(tx.from)}</td>
        <td class="px-4 py-3 text-sm text-gray-300">${skratiHash(tx.to)}</td>
        <td class="px-4 py-3 text-sm text-green-400">${tx.value} ETH</td>
      </tr>
    `;
  });
  
  rezultatDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-4">
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-lg font-semibold text-white">Detalji bloka</h2>
      </div>
      
      <div class="p-4">
        <div class="mb-4">
          <p class="text-gray-400">Broj bloka:</p>
          <p class="text-white">${blok.number}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-gray-400">Hash bloka:</p>
            <p class="text-white break-all">${blok.hash}</p>
          </div>
          
          <div>
            <p class="text-gray-400">Vrijeme:</p>
            <p class="text-white">${formatirajVrijeme(blok.timestamp)}</p>
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
              <tbody class="divide-y divide-gray-700">
                ${transakcijeHTML}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  rezultatDiv.style.display = 'block';
}

// Inicijalizacija nakon učitavanja stranice
document.addEventListener('DOMContentLoaded', function() {
  // Dodaj event listener za pretraživanje
  const searchForm = document.querySelector('.search-input').parentElement;
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  
  // Dodaj div za prikaz rezultata pretrage
  const rezultatDiv = document.createElement('div');
  rezultatDiv.id = 'rezultat-pretrage';
  rezultatDiv.style.display = 'none';
  searchForm.parentElement.appendChild(rezultatDiv);
  
  // Event listener za klik na gumb za pretraživanje
  searchButton.addEventListener('click', function() {
    pretrazi(searchInput.value);
  });
  
  // Event listener za pritisak Enter u polju za pretraživanje
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      pretrazi(searchInput.value);
    }
  });
});
