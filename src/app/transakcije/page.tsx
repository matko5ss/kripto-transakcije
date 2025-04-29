import Pretrazivac from '@/components/Pretrazivac';
import TransakcijeTabela from '@/components/TransakcijeTabela';
import { dohvatiTransakcije } from '@/services/moralis';

export default async function TransakcijePage() {
  // Dohvaćamo zadnjih 20 transakcija
  const transakcije = await dohvatiTransakcije(undefined, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transakcije</h1>
      
      <Pretrazivac />
      
      <TransakcijeTabela 
        transakcije={transakcije} 
        naslov="Zadnje transakcije na Ethereum mreži" 
      />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">O Ethereum transakcijama</h2>
        <p className="mb-3">
          Transakcije na Ethereum mreži predstavljaju prijenos vrijednosti (ETH ili tokena) između adresa ili interakciju sa pametnim ugovorima.
        </p>
        <p className="mb-3">
          Svaka transakcija sadrži sljedeće ključne informacije:
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li>Hash transakcije - jedinstveni identifikator</li>
          <li>Od/Za - adrese pošiljatelja i primatelja</li>
          <li>Vrijednost - količina ETH-a koja se prenosi</li>
          <li>Gas - naknada za obradu transakcije</li>
          <li>Blok - broj bloka u kojem je transakcija potvrđena</li>
          <li>Vrijeme - kada je transakcija potvrđena</li>
        </ul>
        <p>
          Transakcije se grupiraju u blokove i nakon što rudari potvrde blok, transakcije postaju trajni dio Ethereum blockchain-a.
        </p>
      </div>
    </div>
  );
}
