import axios from 'axios';

// CoinGecko API URL
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Tipovi podataka
export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  total_volume: number;
  circulating_supply: number;
  max_supply: number | null;
  image: string;
}

export interface CoinMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/**
 * Dohvaća listu top kriptovaluta
 * @param limit Broj kriptovaluta za dohvatiti
 * @param currency Valuta za cijene (default: usd)
 * @returns Lista kriptovaluta
 */
export const getTopCoins = async (limit: number = 20, currency: string = 'usd'): Promise<CoinPrice[]> => {
  try {
    console.log(`Dohvaćanje top ${limit} kriptovaluta putem CoinGecko API-ja`);
    
    const response = await axios.get(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`
    );
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Greška prilikom dohvaćanja top kriptovaluta:', error);
    return [];
  }
};

/**
 * Dohvaća cijenu određene kriptovalute
 * @param coinId ID kriptovalute (npr. 'bitcoin', 'ethereum')
 * @param currency Valuta za cijenu (default: usd)
 * @returns Cijena kriptovalute
 */
export const getCoinPrice = async (coinId: string, currency: string = 'usd'): Promise<number | null> => {
  try {
    console.log(`Dohvaćanje cijene za ${coinId} putem CoinGecko API-ja`);
    
    const response = await axios.get(
      `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=${currency}`
    );
    
    if (response.data && response.data[coinId] && response.data[coinId][currency]) {
      return response.data[coinId][currency];
    }
    
    return null;
  } catch (error) {
    console.error(`Greška prilikom dohvaćanja cijene za ${coinId}:`, error);
    return null;
  }
};

/**
 * Dohvaća detalje o kriptovaluti
 * @param coinId ID kriptovalute (npr. 'bitcoin', 'ethereum')
 * @returns Detalji o kriptovaluti
 */
export const getCoinDetails = async (coinId: string): Promise<any | null> => {
  try {
    console.log(`Dohvaćanje detalja za ${coinId} putem CoinGecko API-ja`);
    
    const response = await axios.get(
      `${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Greška prilikom dohvaćanja detalja za ${coinId}:`, error);
    return null;
  }
};

/**
 * Dohvaća povijesne podatke o cijeni kriptovalute
 * @param coinId ID kriptovalute (npr. 'bitcoin', 'ethereum')
 * @param days Broj dana za koje se dohvaćaju podaci
 * @param currency Valuta za cijene (default: usd)
 * @returns Povijesni podaci o cijeni
 */
export const getCoinMarketChart = async (
  coinId: string,
  days: number = 30,
  currency: string = 'usd'
): Promise<CoinMarketChart | null> => {
  try {
    console.log(`Dohvaćanje povijesnih podataka za ${coinId} za zadnjih ${days} dana`);
    
    const response = await axios.get(
      `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=daily`
    );
    
    if (response.data) {
      return {
        prices: response.data.prices,
        market_caps: response.data.market_caps,
        total_volumes: response.data.total_volumes
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Greška prilikom dohvaćanja povijesnih podataka za ${coinId}:`, error);
    return null;
  }
};

/**
 * Dohvaća trenutne cijene više kriptovaluta
 * @param coinIds Lista ID-ova kriptovaluta (npr. ['bitcoin', 'ethereum'])
 * @param currency Valuta za cijene (default: usd)
 * @returns Objekt s cijenama
 */
export const getMultipleCoinPrices = async (
  coinIds: string[],
  currency: string = 'usd'
): Promise<Record<string, number> | null> => {
  try {
    console.log(`Dohvaćanje cijena za ${coinIds.join(', ')} putem CoinGecko API-ja`);
    
    const response = await axios.get(
      `${COINGECKO_API_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${currency}`
    );
    
    if (response.data) {
      const prices: Record<string, number> = {};
      
      for (const coinId of coinIds) {
        if (response.data[coinId] && response.data[coinId][currency]) {
          prices[coinId] = response.data[coinId][currency];
        }
      }
      
      return prices;
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja cijena za više kriptovaluta:', error);
    return null;
  }
};

/**
 * Dohvaća globalne podatke o tržištu kriptovaluta
 * @returns Globalni podaci o tržištu
 */
export const getGlobalMarketData = async (): Promise<any | null> => {
  try {
    console.log('Dohvaćanje globalnih podataka o tržištu kriptovaluta');
    
    const response = await axios.get(`${COINGECKO_API_URL}/global`);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Greška prilikom dohvaćanja globalnih podataka o tržištu:', error);
    return null;
  }
};
