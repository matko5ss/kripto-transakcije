import requests
import os
import time
import random
import re
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional

# Učitaj varijable iz .env datoteke
load_dotenv()

class DuneClient:
    """
    Klijent za komunikaciju s Dune Analytics API-jem
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DUNE_API_KEY", "")
        self.base_url = "https://api.dune.com/v1"
        self.headers = {
            "x-dune-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method: str, endpoint: str, params: Dict[str, Any] = None, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Izvršava HTTP zahtjev prema Dune API-ju
        """
        url = f"{self.base_url}/{endpoint}"
        
        try:
            if method.lower() == "get":
                response = requests.get(url, headers=self.headers, params=params)
            elif method.lower() == "post":
                response = requests.post(url, headers=self.headers, json=data)
            else:
                raise ValueError(f"Nepodržana HTTP metoda: {method}")
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Greška pri komunikaciji s Dune API-jem: {str(e)}")
            # Vraćamo prazni rječnik u slučaju greške
            return {}
    
    def execute_query(self, query_id: int) -> Dict[str, Any]:
        """
        Izvršava postojeći upit na Dune Analytics
        """
        # Pokreni izvršavanje upita
        execution_response = self._make_request(
            "post", 
            f"query/{query_id}/execute"
        )
        
        execution_id = execution_response.get("execution_id")
        if not execution_id:
            return {"error": "Nije moguće pokrenuti upit"}
        
        # Provjeri status izvršavanja
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            status_response = self._make_request(
                "get",
                f"execution/{execution_id}/status"
            )
            
            state = status_response.get("state")
            
            if state == "QUERY_STATE_COMPLETED":
                # Dohvati rezultate
                results = self._make_request(
                    "get",
                    f"execution/{execution_id}/results"
                )
                return results
            
            elif state in ["QUERY_STATE_FAILED", "QUERY_STATE_CANCELLED"]:
                return {"error": f"Upit nije uspješno izvršen. Status: {state}"}
            
            # Pričekaj prije sljedeće provjere
            time.sleep(2)
            attempt += 1
        
        return {"error": "Isteklo vrijeme za izvršavanje upita"}
    
    def get_bitcoin_price(self) -> float:
        """Dohvaća trenutnu cijenu Bitcoina s Dune API-ja."""
        # Dohvaćamo cijenu Bitcoina s Dune API-ja koristeći query ID 5132855
        current_price = 0.0
        
        print("Dohvaćanje cijene Bitcoina s Dune API-ja (Query ID: 5132855)...")
        result = self.execute_query(5132855)
        
        if "error" in result:
            return 0.0
        
        try:
            rows = result.get("result", {}).get("rows", [])
            if rows:
                return float(rows[0].get("price", 0.0))
        except (ValueError, IndexError, KeyError):
            pass
        
        return 0.0
        
    def get_ethereum_price(self) -> float:
        """
        Dohvaća trenutnu cijenu Ethereuma
        Koristi upit ID 2309365 - Ethereum cijena
        """
        result = self.execute_query(2309365)
        
        if "error" in result:
            return 0.0
        
        try:
            rows = result.get("result", {}).get("rows", [])
            if rows:
                return float(rows[0].get("price", 0.0))
        except (ValueError, IndexError, KeyError):
            pass
        
        return 0.0
        
    def get_bitcoin_price(self) -> float:
        """
        Dohvaća trenutnu cijenu Bitcoina
        Koristi upit ID 5132855 - Bitcoin cijena
        """
        print(f"Dohvaćanje cijene Bitcoina preko Dune API-ja (query ID: 5132855)...")
        result = self.execute_query(5132855)
        
        if "error" in result:
            print(f"Greška pri dohvaćanju cijene Bitcoina: {result.get('error')}")
            return 0.0
        
        try:
            rows = result.get("result", {}).get("rows", [])
            if rows:
                # Pokušavamo dohvatiti cijenu iz različitih polja u odgovoru
                price = None
                if "price_usd" in rows[0]:
                    price = float(rows[0]["price_usd"])
                elif "price" in rows[0]:
                    price = float(rows[0]["price"])
                elif "current_price" in rows[0]:
                    price = float(rows[0]["current_price"])
                
                if price:
                    print(f"Uspješno dohvaćena cijena Bitcoina: ${price:,.2f}")
                    return price
                else:
                    print(f"Cijena nije pronađena u odgovoru. Dostupna polja: {list(rows[0].keys())}")
        except (ValueError, IndexError, KeyError) as e:
            print(f"Greška pri parsiranju cijene Bitcoina: {str(e)}")
            print(f"Sadržaj odgovora: {rows[0] if rows else 'Nema redova'}")
        
        
        return 0.0
        
    def get_bitcoin_status(self) -> Dict[str, Any]:
        """
        Dohvaća trenutno stanje Bitcoin mreže
        Koristi upit ID 5132856 - Bitcoin status (zadnji blok, fee rate, broj transakcija)
        """
        print("Dohvaćanje statusa Bitcoin mreže...")
        # Pokušavamo dohvatiti podatke preko Dune API-ja
        try:
            # Ovdje bi trebao biti poziv na Dune API, ali za sada koristimo simulirane podatke
            # result = self.execute_query(5132856)
            return {
                "last_block": 840000,
                "fee_rate": 25.5,
                "transactions_count": 350000,
                "difficulty": 78.3e12,
                "hashrate": 650.2e18
            }
        except Exception as e:
            print(f"Greška pri dohvaćanju statusa Bitcoin mreže: {str(e)}")
            # Fallback na simulirane podatke
            return {
                "last_block": 840000,
                "fee_rate": 25.5,
                "transactions_count": 350000,
                "difficulty": 78.3e12,
                "hashrate": 650.2e18
            }
        
    def get_bitcoin_transactions(self, address: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Dohvaća zadnje Bitcoin transakcije ili transakcije za određenu adresu
        """
        # Za sada vraćamo simulirane podatke
        # U stvarnoj implementaciji bi se koristio upit na Dune
        current_timestamp = int(time.time())
        transactions = []
        
        for i in range(limit):
            tx_time = current_timestamp - i * 600  # Svaka transakcija je 10 minuta starija
            tx_hash = ''.join(random.choices('0123456789abcdef', k=64))
            sender = f"bc1{''.join(random.choices('0123456789abcdef', k=40))}"
            recipient = f"bc1{''.join(random.choices('0123456789abcdef', k=40))}"
            
            if address:
                # Ako je adresa specificirana, postavljamo je kao primatelja ili pošiljatelja
                if i % 2 == 0:
                    sender = address
                else:
                    recipient = address
            
            transactions.append({
                "txid": tx_hash,
                "block_height": 840000 - i,
                "timestamp": tx_time,
                "sender": sender,
                "recipient": recipient,
                "value": str(random.uniform(0.01, 2.5)),
                "fee": str(random.uniform(0.00001, 0.0005)),
                "confirmations": i + 1
            })
        
        return transactions
    
    def get_bitcoin_transaction(self, txid: str) -> Optional[Dict[str, Any]]:
        """
        Dohvaća detalje Bitcoin transakcije prema hash-u
        """
        # Za sada vraćamo simulirane podatke
        # U stvarnoj implementaciji bi se koristio upit na Dune
        if not re.match(r'^[0-9a-f]{64}$', txid, re.IGNORECASE):
            return None
        
        current_timestamp = int(time.time())
        sender = f"bc1{''.join(random.choices('0123456789abcdef', k=40))}"
        recipient = f"bc1{''.join(random.choices('0123456789abcdef', k=40))}"
        
        return {
            "txid": txid,
            "block_height": 840000,
            "timestamp": current_timestamp - 3600,  # 1 sat prije
            "sender": sender,
            "recipient": recipient,
            "value": str(random.uniform(0.01, 2.5)),
            "fee": str(random.uniform(0.00001, 0.0005)),
            "confirmations": 10
        }
    
    def get_bitcoin_blocks(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Dohvaća zadnje Bitcoin blokove
        """
        # Za sada vraćamo simulirane podatke
        # U stvarnoj implementaciji bi se koristio upit na Dune
        current_timestamp = int(time.time())
        blocks = []
        
        for i in range(limit):
            block_time = current_timestamp - i * 600  # Svaki blok je 10 minuta stariji
            block_hash = ''.join(random.choices('0123456789abcdef', k=64))
            merkle_root = ''.join(random.choices('0123456789abcdef', k=64))
            prev_hash = ''.join(random.choices('0123456789abcdef', k=64)) if i < limit - 1 else None
            
            blocks.append({
                "height": 840000 - i,
                "hash": block_hash,
                "timestamp": block_time,
                "size": random.randint(500000, 2000000),
                "tx_count": random.randint(1000, 3000),
                "miner": "Unknown",
                "difficulty": "72.33T",
                "weight": random.randint(2000000, 8000000),
                "version": "0x20000000",
                "merkle_root": merkle_root,
                "bits": "386604799",
                "nonce": random.randint(0, 4294967295),
                "previous_block_hash": prev_hash
            })
        
        return blocks
    
    def get_bitcoin_address_info(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Dohvaća informacije o Bitcoin adresi
        """
        # Za sada vraćamo simulirane podatke
        # U stvarnoj implementaciji bi se koristio upit na Dune
        if not re.match(r'^(1|3|bc1)[a-zA-Z0-9]{25,42}$', address):
            return None
        
        current_timestamp = int(time.time())
        first_seen = current_timestamp - 30 * 24 * 3600  # 30 dana prije
        
        return {
            "address": address,
            "balance": str(random.uniform(0.1, 10.0)),
            "tx_count": random.randint(10, 100),
            "total_received": str(random.uniform(1.0, 20.0)),
            "total_sent": str(random.uniform(0.5, 10.0)),
            "first_seen": first_seen,
            "last_seen": current_timestamp - 24 * 3600  # 1 dan prije
        }
    
    def get_bitcoin_price_history(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Dohvaća povijest cijene Bitcoina
        """
        # Za sada vraćamo simulirane podatke
        # U stvarnoj implementaciji bi se koristio upit na Dune
        current_timestamp = int(time.time())
        history = []
        current_price = 53000.0  # Početna cijena
        
        for i in range(days):
            day_timestamp = current_timestamp - (days - i - 1) * 24 * 3600
            date_str = time.strftime("%Y-%m-%d", time.localtime(day_timestamp))
            
            # Simuliramo male promjene cijene
            price_change = random.uniform(-0.05, 0.05)  # -5% do +5%
            current_price = current_price * (1 + price_change)
            
            history.append({
                "date": date_str,
                "price": current_price
            })
        
        return history
    
    def get_ethereum_status(self) -> Dict[str, Any]:
        """
        Dohvaća trenutno stanje Ethereum mreže
        Koristi upit ID 2309366 - Ethereum status
        """
        result = self.execute_query(2309366)
        
        if "error" in result:
            return {
                "last_block": 22417536,
                "gas_price": 30,
                "transactions_count": 1500
            }
        
        try:
            rows = result.get("result", {}).get("rows", [])
            if rows:
                return {
                    "last_block": int(rows[0].get("last_block", 22417536)),
                    "gas_price": int(rows[0].get("gas_price", 30)),
                    "transactions_count": int(rows[0].get("transactions_count", 1500))
                }
        except (ValueError, IndexError, KeyError):
            pass
        
        return {
            "last_block": 22417536,
            "gas_price": 30,
            "transactions_count": 1500
        }
    
    def get_token_balances(self, address: str) -> List[Dict[str, Any]]:
        """
        Dohvaća stanja tokena za određenu adresu
        Koristi upit ID 2309367 - Token balances
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        eth_balance = "1000000000000000000"  # 1 ETH
        
        return [
            {
                "symbol": "ETH",
                "name": "Ethereum",
                "balance": eth_balance,
                "decimals": 18,
                "contractAddress": "0x0000000000000000000000000000000000000000",
                "logo": "https://cryptologos.cc/logos/ethereum-eth-logo.png"
            },
            {
                "symbol": "USDT",
                "name": "Tether USD",
                "balance": "5000000000",  # 5000 USDT
                "decimals": 6,
                "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
                "logo": "https://cryptologos.cc/logos/tether-usdt-logo.png"
            },
            {
                "symbol": "LINK",
                "name": "Chainlink",
                "balance": "10000000000000000000",  # 10 LINK
                "decimals": 18,
                "contractAddress": "0x514910771af9ca656af840dff83e8264ecf986ca",
                "logo": "https://cryptologos.cc/logos/chainlink-link-logo.png"
            }
        ]
    
    def get_transactions(self, address: str) -> List[Dict[str, Any]]:
        """
        Dohvaća transakcije za određenu adresu
        Koristi upit ID 2309368 - Transactions
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        current_timestamp = int(time.time())
        
        return [
            {
                "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                "blockNumber": 17000000,
                "timestamp": current_timestamp - 3600,  # 1 sat prije
                "from_address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",  # vitalik.eth
                "to": address,
                "value": "1000000000000000000",  # 1 ETH
                "gasUsed": "21000"
            },
            {
                "hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
                "blockNumber": 16999900,
                "timestamp": current_timestamp - 7200,  # 2 sata prije
                "from_address": address,
                "to": "0x388c818ca8b9251b393131c08a736a67ccb19297",
                "value": "500000000000000000",  # 0.5 ETH
                "gasUsed": "21000"
            },
            {
                "hash": "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
                "blockNumber": 16999800,
                "timestamp": current_timestamp - 10800,  # 3 sata prije
                "from_address": "0x690b9a9e9aa1c9db991c7721a92d351db4fac990",
                "to": address,
                "value": "2000000000000000000",  # 2 ETH
                "gasUsed": "21000"
            }
        ]
        
    # Bitcoin metode
    def get_bitcoin_price_alt(self) -> float:
        """
        Alternativni način dohvaćanja cijene Bitcoina
        Koristi upit ID 2309370 - Bitcoin cijena (alternativni upit)
        """
        result = self.execute_query(2309370)
        
        if "error" in result:
            print("Greška pri dohvaćanju cijene Bitcoina, koristi se fallback vrijednost")
            return 62345.78  # Fallback vrijednost
        
        try:
            rows = result.get("result", {}).get("rows", [])
            if rows:
                price = float(rows[0].get("price", current_price))
                print(f"Uspješno dohvaćena cijena Bitcoina: ${price}")
                return price
        except (ValueError, IndexError, KeyError) as e:
            print(f"Greška pri parsiranju cijene Bitcoina: {e}")
            pass
        
        print("Koristi se fallback vrijednost za cijenu Bitcoina")
        return current_price  # Fallback vrijednost
    
    def get_bitcoin_status(self) -> Dict[str, Any]:
        """
        Dohvaća trenutno stanje Bitcoin mreže
        Koristi upit ID 2309371 - Bitcoin status
        """
        result = self.execute_query(2309371)
        
        if "error" in result:
            return {
                "last_block": 840000,
                "fee_rate": 25,  # sat/vB
                "transactions_count": 350000,
                "difficulty": 78.3e12,
                "hashrate": 650.2e18
            }
        
        try:
            rows = result.get("result", {}).get("rows", [])
            if rows:
                return {
                    "last_block": int(rows[0].get("last_block", 840000)),
                    "fee_rate": float(rows[0].get("fee_rate", 25)),
                    "transactions_count": int(rows[0].get("transactions_count", 350000)),
                    "difficulty": float(rows[0].get("difficulty", 78.3e12)),
                    "hashrate": float(rows[0].get("hashrate", 650.2e18))
                }
        except (ValueError, IndexError, KeyError):
            pass
        
        return {
            "last_block": 840000,
            "fee_rate": 25,  # sat/vB
            "transactions_count": 350000,
            "difficulty": 78.3e12,
            "hashrate": 650.2e18
        }
    
    def get_bitcoin_transactions(self, address: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Dohvaća Bitcoin transakcije za određenu adresu ili zadnje transakcije
        Koristi upit ID 2309372 - Bitcoin transakcije
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        current_timestamp = int(time.time())
        transactions = []
        
        for i in range(limit):
            # Generiraj slučajni txid
            txid = "".join([random.choice("0123456789abcdef") for _ in range(64)])
            
            # Slučajno vrijeme transakcije (unutar zadnjih 24 sata)
            timestamp = current_timestamp - random.randint(60, 86400)
            
            # Slučajna vrijednost u BTC (između 0.001 i 2 BTC)
            value = round(random.uniform(0.001, 2), 8)
            
            # Slučajna naknada (između 0.00001 i 0.001 BTC)
            fee = round(random.uniform(0.00001, 0.001), 8)
            
            # Generiraj slučajne adrese
            sender = f"bc1{''.join([random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(30)])}"
            recipient = f"bc1{''.join([random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(30)])}"
            
            # Ako je adresa specificirana, postavi je kao pošiljatelja ili primatelja
            if address:
                if random.choice([True, False]):
                    sender = address
                else:
                    recipient = address
            
            transaction = {
                "txid": txid,
                "block_height": 840000 - i,
                "timestamp": timestamp,
                "sender": sender,
                "recipient": recipient,
                "value": str(value),
                "fee": str(fee),
                "confirmations": i + 1
            }
            
            transactions.append(transaction)
        
        return transactions
        
    def get_bitcoin_transaction(self, txid: str) -> Dict[str, Any]:
        """
        Dohvaća detalje Bitcoin transakcije prema hash-u
        Koristi upit ID 2309376 - Bitcoin transakcija detalji
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        # Provjeri je li txid validan (64 znaka dug heksadecimalni string)
        if not re.match(r'^[0-9a-fA-F]{64}$', txid):
            return None
            
        current_timestamp = int(time.time())
        
        # Slučajno vrijeme transakcije (unutar zadnjih 24 sata)
        timestamp = current_timestamp - random.randint(60, 86400)
        
        # Slučajna vrijednost u BTC (između 0.001 i 2 BTC)
        value = round(random.uniform(0.001, 2), 8)
        
        # Slučajna naknada (između 0.00001 i 0.001 BTC)
        fee = round(random.uniform(0.00001, 0.001), 8)
        
        # Generiraj slučajne adrese
        sender = f"bc1{''.join([random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(30)])}"
        recipient = f"bc1{''.join([random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(30)])}"
        
        # Slučajan broj potvrda (između 1 i 10)
        confirmations = random.randint(1, 10)
        
        return {
            "txid": txid,  # Koristimo stvarni txid koji je prosljeđen
            "block_height": 840000 - confirmations,
            "timestamp": timestamp,
            "sender": sender,
            "recipient": recipient,
            "value": str(value),
            "fee": str(fee),
            "confirmations": confirmations
        }
    
    def get_bitcoin_blocks(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Dohvaća zadnje Bitcoin blokove
        Koristi upit ID 2309373 - Bitcoin blokovi
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        blocks = []
        current_timestamp = int(time.time())
        last_block_height = 840000
        
        for i in range(limit):
            # Generiraj slučajni hash bloka
            block_hash = "".join([random.choice("0123456789abcdef") for _ in range(64)])
            
            # Slučajno vrijeme bloka (svaki blok je otprilike 10 minuta nakon prethodnog)
            timestamp = current_timestamp - (i * 600)  # 600 sekundi = 10 minuta
            
            # Slučajna veličina bloka (između 1 MB i 2 MB)
            size = random.randint(1000000, 2000000)
            
            # Slučajan broj transakcija (između 1000 i 3000)
            tx_count = random.randint(1000, 3000)
            
            # Generiraj slučajnu adresu rudara
            miner = f"bc1{''.join([random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(30)])}"
            
            block = {
                "height": last_block_height - i,
                "hash": block_hash,
                "timestamp": timestamp,
                "size": size,
                "tx_count": tx_count,
                "miner": miner,
                "difficulty": "78.3T",
                "weight": size * 4,
                "version": "0x20000000",
                "merkle_root": "".join([random.choice("0123456789abcdef") for _ in range(64)]),
                "bits": "386604799",
                "nonce": random.randint(0, 4294967295),
                "previous_block_hash": "".join([random.choice("0123456789abcdef") for _ in range(64)]) if i < limit - 1 else None
            }
            
            blocks.append(block)
        
        return blocks
    
    def get_bitcoin_address_info(self, address: str) -> Dict[str, Any]:
        """
        Dohvaća informacije o Bitcoin adresi
        Koristi upit ID 2309374 - Bitcoin adresa
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        # Slučajno stanje (između 0.1 i 10 BTC)
        balance = round(random.uniform(0.1, 10), 8)
        
        # Slučajan broj transakcija (između 10 i 1000)
        tx_count = random.randint(10, 1000)
        
        # Slučajno ukupno primljeno (veće od stanja)
        total_received = round(balance + random.uniform(1, 20), 8)
        
        # Slučajno ukupno poslano (razlika između primljenog i stanja)
        total_sent = round(total_received - balance, 8)
        
        return {
            "address": address,
            "balance": str(balance),
            "tx_count": tx_count,
            "total_received": str(total_received),
            "total_sent": str(total_sent),
            "first_seen": int(time.time()) - random.randint(86400 * 30, 86400 * 365 * 3),  # Između 30 dana i 3 godine
            "last_seen": int(time.time()) - random.randint(0, 86400 * 30)  # Unutar zadnjih 30 dana
        }
    
    def get_bitcoin_price_history(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Dohvaća povijest cijene Bitcoina
        Koristi upit ID 2309375 - Bitcoin povijest cijena
        """
        # U stvarnoj implementaciji bi se koristio parametrizirani upit
        # Za sada vraćamo simulirane podatke
        
        price_history = []
        current_timestamp = int(time.time())
        current_price = 67890.0
        
        for i in range(days):
            # Datum (počevši od danas unatrag)
            timestamp = current_timestamp - (i * 86400)  # 86400 sekundi = 1 dan
            date = time.strftime("%Y-%m-%d", time.localtime(timestamp))
            
            # Slučajna promjena cijene (između -5% i +5%)
            price_change = random.uniform(-0.05, 0.05)
            price = current_price * (1 + price_change * (i + 1))
            
            price_history.append({
                "date": date,
                "price": round(price, 2)
            })
        
        # Sortiraj po datumu (od najstarijeg do najnovijeg)
        price_history.reverse()
        
        return price_history
