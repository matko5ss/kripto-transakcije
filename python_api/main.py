from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
from dune_client import DuneClient

# Učitaj varijable iz .env datoteke
load_dotenv()

app = FastAPI(title="Dune API Python Backend")

# Dodaj CORS middleware za komunikaciju s React aplikacijom
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # U produkciji ograničiti na domenu React aplikacije
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dohvati API ključ iz okoline
DUNE_API_KEY = os.getenv("DUNE_API_KEY", "KbXKuJ2niPQF13TRf1e45ae4hshStmTy")

# Ethereum modeli podataka
class Token(BaseModel):
    symbol: str
    name: str
    balance: str
    decimals: int
    contractAddress: str
    logo: Optional[str] = None

class Transaction(BaseModel):
    hash: str
    blockNumber: int
    timestamp: int
    from_address: str
    to: Optional[str]
    value: str
    gasUsed: str

class EthereumStatus(BaseModel):
    price: float
    last_block: int
    gas_price: int
    transactions_count: int
    
# Bitcoin modeli podataka
class BitcoinTransaction(BaseModel):
    txid: str
    block_height: int
    timestamp: int
    sender: str
    recipient: str
    value: str
    fee: str
    confirmations: int

class BitcoinBlock(BaseModel):
    height: int
    hash: str
    timestamp: int
    size: int
    tx_count: int
    miner: str
    difficulty: str
    weight: int
    version: str
    merkle_root: str
    bits: str
    nonce: int
    previous_block_hash: Optional[str] = None

class BitcoinAddressInfo(BaseModel):
    address: str
    balance: str
    tx_count: int
    total_received: str
    total_sent: str
    first_seen: int
    last_seen: int

class BitcoinStatus(BaseModel):
    price: float
    last_block: int
    fee_rate: float
    transactions_count: int
    difficulty: float
    hashrate: float

class BitcoinPriceHistory(BaseModel):
    date: str
    price: float

# Dependency za dohvaćanje Dune klijenta
def get_dune_client():
    return DuneClient(DUNE_API_KEY)

# API rute
@app.get("/")
def read_root():
    return {"message": "Dune API Python Backend je aktivan"}

@app.get("/api/token-balances/{address}", response_model=List[Token])
def get_token_balances(address: str, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća stanja tokena za određenu adresu"""
    try:
        tokens = dune_client.get_token_balances(address)
        return [Token(**token) for token in tokens]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju stanja tokena: {str(e)}")

@app.get("/api/transactions/{address}", response_model=List[Transaction])
def get_transactions(address: str, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća transakcije za određenu adresu"""
    try:
        transactions = dune_client.get_transactions(address)
        return [Transaction(**tx) for tx in transactions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju transakcija: {str(e)}")

@app.get("/api/ethereum-status", response_model=EthereumStatus)
def get_ethereum_status(dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća trenutno stanje Ethereum mreže"""
    try:
        eth_status = dune_client.get_ethereum_status()
        eth_price = dune_client.get_ethereum_price()
        
        return EthereumStatus(
            price=eth_price,
            last_block=eth_status.get("last_block", 22417536),
            gas_price=eth_status.get("gas_price", 30),
            transactions_count=eth_status.get("transactions_count", 1500)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju stanja Ethereum mreže: {str(e)}")

# Bitcoin API rute
@app.get("/api/bitcoin/status", response_model=BitcoinStatus)
def get_bitcoin_status(dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća trenutno stanje Bitcoin mreže"""
    try:
        btc_status = dune_client.get_bitcoin_status()
        btc_price = dune_client.get_bitcoin_price()
        
        return BitcoinStatus(
            price=btc_price,
            last_block=btc_status.get("last_block", 840000),
            fee_rate=btc_status.get("fee_rate", 25),
            transactions_count=btc_status.get("transactions_count", 350000),
            difficulty=btc_status.get("difficulty", 78.3e12),
            hashrate=btc_status.get("hashrate", 650.2e18)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju stanja Bitcoin mreže: {str(e)}")

@app.get("/api/bitcoin/transactions", response_model=List[BitcoinTransaction])
def get_bitcoin_transactions(limit: int = 10, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća zadnje Bitcoin transakcije"""
    try:
        transactions = dune_client.get_bitcoin_transactions(limit=limit)
        return [BitcoinTransaction(**tx) for tx in transactions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju Bitcoin transakcija: {str(e)}")

@app.get("/api/bitcoin/transactions/{address}", response_model=List[BitcoinTransaction])
def get_bitcoin_address_transactions(address: str, limit: int = 10, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća Bitcoin transakcije za određenu adresu"""
    try:
        transactions = dune_client.get_bitcoin_transactions(address=address, limit=limit)
        return [BitcoinTransaction(**tx) for tx in transactions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju Bitcoin transakcija za adresu: {str(e)}")

@app.get("/api/bitcoin/transaction/{txid}", response_model=BitcoinTransaction)
def get_bitcoin_transaction(txid: str, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća detalje Bitcoin transakcije prema hash-u"""
    try:
        transaction = dune_client.get_bitcoin_transaction(txid)
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transakcija s hash-om {txid} nije pronađena")
        return BitcoinTransaction(**transaction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju Bitcoin transakcije: {str(e)}")

@app.get("/api/bitcoin/blocks", response_model=List[BitcoinBlock])
def get_bitcoin_blocks(limit: int = 5, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća zadnje Bitcoin blokove"""
    try:
        blocks = dune_client.get_bitcoin_blocks(limit=limit)
        return [BitcoinBlock(**block) for block in blocks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju Bitcoin blokova: {str(e)}")

@app.get("/api/bitcoin/address/{address}", response_model=BitcoinAddressInfo)
def get_bitcoin_address_info(address: str, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća informacije o Bitcoin adresi"""
    try:
        address_info = dune_client.get_bitcoin_address_info(address)
        return BitcoinAddressInfo(**address_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju informacija o Bitcoin adresi: {str(e)}")

@app.get("/api/bitcoin/price-history", response_model=List[BitcoinPriceHistory])
def get_bitcoin_price_history(days: int = 7, dune_client: DuneClient = Depends(get_dune_client)):
    """Dohvaća povijest cijene Bitcoina"""
    try:
        price_history = dune_client.get_bitcoin_price_history(days)
        return [BitcoinPriceHistory(**item) for item in price_history]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greška pri dohvaćanju povijesti cijene Bitcoina: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
