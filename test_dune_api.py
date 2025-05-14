import requests
import json
import time
import pprint

# Dune API key
API_KEY = "KbXKuJ2niPQF13TRf1e45ae4hshStmTy"

def get_bitcoin_price():
    try:
        # Endpoint za Dune API - koristimo query ID 5132855 za trenutnu cijenu Bitcoina
        url = "https://api.dune.com/api/v1/query/5132855/execute"
        
        # Headers sa API ključem
        headers = {
            "x-dune-api-key": API_KEY,
            "Content-Type": "application/json"
        }
        
        # Pokretanje query-ja
        print(f"Slanje zahtjeva na {url}...")
        response = requests.post(url, headers=headers)
        print(f"Status kod: {response.status_code}")
        print(f"Odgovor: {response.text[:200]}...")
        
        if response.status_code == 200:
            execution_id = response.json().get("execution_id")
            if not execution_id:
                print(f"Nedostaje execution_id u odgovoru: {response.text}")
                return None
                
            status_url = f"https://api.dune.com/api/v1/execution/{execution_id}/status"
            print(f"Provjera statusa na: {status_url}")
            
            # Čekanje da se query izvrši
            max_attempts = 5
            attempts = 0
            while attempts < max_attempts:
                attempts += 1
                print(f"Pokušaj {attempts}/{max_attempts}")
                
                status_response = requests.get(status_url, headers=headers)
                print(f"Status kod provjere: {status_response.status_code}")
                
                if status_response.status_code != 200:
                    print(f"Greška pri dohvaćanju statusa: {status_response.text}")
                    time.sleep(2)
                    continue
                    
                status_data = status_response.json()
                print(f"Status izvršavanja: {status_data.get('state')}")
                
                if status_data.get("state") == "QUERY_STATE_COMPLETED":
                    # Dohvaćanje rezultata
                    results_url = f"https://api.dune.com/api/v1/execution/{execution_id}/results"
                    print(f"Dohvaćanje rezultata sa: {results_url}")
                    results_response = requests.get(results_url, headers=headers)
                    
                    if results_response.status_code == 200:
                        results_data = results_response.json()
                        rows = results_data.get("result", {}).get("rows", [])
                        
                        if rows:
                            # Ispisujemo sve ključeve iz prvog reda da vidimo strukturu podataka
                            print("Struktura podataka:")
                            pprint.pprint(rows[0])
                            
                            # Pokušavamo pronaći cijenu u različitim poljima
                            price = None
                            if "price" in rows[0]:
                                price = rows[0]["price"]
                            elif "price_usd" in rows[0]:
                                price = rows[0]["price_usd"]
                            elif "current_price" in rows[0]:
                                price = rows[0]["current_price"]
                            elif "value" in rows[0]:
                                price = rows[0]["value"]
                            
                            # Ako još uvijek nemamo cijenu, pokušajmo pronaći bilo koji ključ koji sadrži 'price'
                            if price is None:
                                for key, value in rows[0].items():
                                    if isinstance(value, (int, float)) and "price" in key.lower():
                                        price = value
                                        print(f"Pronađena cijena u polju {key}")
                                        break
                            
                            print(f"Pronađena cijena: {price}")
                            return price
                        else:
                            print(f"Nema redova u rezultatu: {results_data}")
                    else:
                        print(f"Greška pri dohvaćanju rezultata: {results_response.text}")
                    
                    break
                
                elif status_data.get("state") in ["QUERY_STATE_FAILED", "QUERY_STATE_CANCELLED"]:
                    print(f"Query failed: {status_data}")
                    break
                    
                elif attempts >= max_attempts:
                    print("Dosegnut maksimalan broj pokušaja")
                    break
                
                # Pauza prije sljedećeg pokušaja
                print("Čekanje 2 sekunde...")
                time.sleep(2)
        else:
            print(f"Greška pri pokretanju query-ja: {response.text}")
            
    except Exception as e:
        print(f"Došlo je do greške: {str(e)}")
    
    return None

# Isključivo koristimo Dune API za dohvaćanje cijene Bitcoina

if __name__ == "__main__":
    print("Dohvaćanje trenutne cijene Bitcoina preko Dune API-ja (Query ID: 5132855)...")
    print("URL: https://dune.com/queries/5132855")
    price = get_bitcoin_price()
    
    if price:
        print(f"\nTRENUTNA CIJENA BITCOINA: ${price:,.2f} USD")
        print("\nPodaci uspješno dohvaćeni s Dune API-ja!")
    else:
        print("\nNije moguće dohvatiti cijenu Bitcoina preko Dune API-ja.")
        print("Molimo provjerite je li query ID 5132855 ispravan i vraća li očekivane podatke.")
        print("Možete provjeriti query na: https://dune.com/queries/5132855")
