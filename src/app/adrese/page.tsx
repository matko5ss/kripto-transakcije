import Pretrazivac from '@/components/Pretrazivac';
import { FaWallet } from 'react-icons/fa';

export default function AdresePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Adrese</h1>
      
      <Pretrazivac />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaWallet className="text-purple-600" />
          <h2 className="text-xl font-semibold">Pretraži Ethereum adrese</h2>
        </div>
        
        <p className="mb-4">
          Unesite Ethereum adresu u tražilicu iznad kako biste vidjeli detalje o stanju, transakcijama i tokenima.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Što su Ethereum adrese?</h3>
          <p className="mb-2">
            Ethereum adrese su jedinstveni identifikatori koji se koriste za slanje i primanje transakcija na Ethereum mreži.
            Svaka adresa je dugačka 42 znaka i počinje s &quot;0x&quot;, nakon čega slijedi 40 heksadecimalnih znakova.
          </p>
          <p>
            Primjer Ethereum adrese: <code className="bg-gray-100 px-2 py-1 rounded">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</code>
          </p>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Što možete vidjeti za svaku adresu?</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Trenutno stanje ETH-a na adresi</li>
            <li>Povijest transakcija (poslanih i primljenih)</li>
            <li>ERC-20 tokene koje adresa posjeduje</li>
            <li>NFT-ove (ERC-721 tokene) koje adresa posjeduje</li>
            <li>Interakcije s pametnim ugovorima</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
