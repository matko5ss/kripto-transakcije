#!/bin/bash

# Skripta za postavljanje Dune API ključa u .env.local datoteku
# Ova datoteka neće biti praćena u git repozitoriju

# Provjeri postoji li .env.local datoteka
if [ ! -f .env.local ]; then
    touch .env.local
    echo "Kreirana nova .env.local datoteka"
fi

# Postavi Dune API ključ
echo "DUNE_API_KEY=KbXKuJ2niPQF13TRf1e45ae4hshStmTy" > .env.local

echo "Dune API ključ je uspješno postavljen u .env.local datoteku"
echo "NAPOMENA: .env.local datoteka je dodana u .gitignore i neće biti praćena u git repozitoriju"
