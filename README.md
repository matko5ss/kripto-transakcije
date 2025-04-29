# Kripto Transakcije

Aplikacija za praćenje kripto transakcija na hrvatskom jeziku, slična [Etherscan.io](https://etherscan.io/), ali prilagođena hrvatskim korisnicima.

## O projektu

Kripto Transakcije je web aplikacija koja omogućuje korisnicima pregled i pretraživanje Ethereum blockchain-a na hrvatskom jeziku. Aplikacija koristi [Moralis API](https://moralis.io/) za dohvaćanje podataka s blockchain-a.

### Funkcionalnosti

- Pregled zadnjih transakcija na Ethereum mreži
- Pregled detalja pojedinačnih transakcija
- Pregled blokova i njihovih detalja
- Pregled adresa/novčanika i njihovog stanja
- Pregled ERC-20 tokena
- Praćenje cijene Ethereuma
- Sve na hrvatskom jeziku!

## Tehnologije

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Moralis API](https://moralis.io/) - API za dohvaćanje blockchain podataka
- [Chart.js](https://www.chartjs.org/) - Biblioteka za grafikone
- [React Icons](https://react-icons.github.io/react-icons/) - Ikone
- [date-fns](https://date-fns.org/) - Biblioteka za rad s datumima

## Pokretanje projekta

### Preduvjeti

- Node.js (preporučeno verzija 18 ili novija)
- npm ili yarn
- Moralis API ključ (možete ga dobiti besplatno na [Moralis.io](https://moralis.io/))

### Instalacija

1. Klonirajte repozitorij:
```bash
git clone <url-repozitorija>
cd kripto-transakcije
```

2. Instalirajte ovisnosti:
```bash
npm install
# ili
yarn install
```

3. Pokrenite razvojni server:
```bash
npm run dev
# ili
yarn dev
```

4. Otvorite [http://localhost:3000](http://localhost:3000) u vašem pregledniku.

## Konfiguracija

API ključ za Moralis je već konfiguriran u aplikaciji. Ako želite koristiti svoj vlastiti ključ, možete ga promijeniti u datoteci `config/moralis.ts`.

## Dodatne informacije

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
