declare module '@duneanalytics/hooks' {
  // DuneProvider komponenta
  export interface DuneProviderProps {
    apiKey: string;
    children: React.ReactNode;
  }
  
  export function DuneProvider(props: DuneProviderProps): JSX.Element;
  
  // Token balances hook
  export interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    contractAddress?: string;
    logo?: string;
  }
  
  export interface UseTokenBalancesResult {
    data: TokenBalance[] | null;
    isLoading: boolean;
    error: Error | null;
  }
  
  export function useTokenBalances(address: string): UseTokenBalancesResult;
  
  // Transactions hook
  export interface Transaction {
    hash: string;
    blockNumber: number;
    timestamp: number;
    from: string;
    to: string | null;
    value: string;
    gasUsed: string;
    gasPrice?: string;
    input?: string;
    status?: number;
  }
  
  export interface UseTransactionsResult {
    data: Transaction[] | null;
    isLoading: boolean;
    error: Error | null;
    fetchMore?: () => void;
    hasMore?: boolean;
  }
  
  export function useTransactions(address: string, options?: {
    limit?: number;
    offset?: number;
  }): UseTransactionsResult;
  
  // Ethereum status hook
  export interface EthereumStatusData {
    latestBlock: number;
    gasPrice: string;
    ethPrice: string;
    transactionCount: number;
  }
  
  export interface UseEthereumStatusResult {
    data: EthereumStatusData | null;
    isLoading: boolean;
    error: Error | null;
  }
  
  export function useEthereumStatus(): UseEthereumStatusResult;
  
  // NFT hook
  export interface NFT {
    tokenId: string;
    contractAddress: string;
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  }
  
  export interface UseNFTsResult {
    data: NFT[] | null;
    isLoading: boolean;
    error: Error | null;
    fetchMore?: () => void;
    hasMore?: boolean;
  }
  
  export function useNFTs(address: string, options?: {
    limit?: number;
    offset?: number;
  }): UseNFTsResult;
}
