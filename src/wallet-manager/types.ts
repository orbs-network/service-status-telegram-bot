type Wallet = {
  address: string;
  balance: string;
  balanceInWU: number;
  txCount: number;
};

type Transactions = {
  calls: number;
  callsFailed: number;
  send: number;
  success: number;
  revert: number;
  failed: number;
};

type Network = {
  status: string;
  errorCount: number;
  transactions: Transactions;
  latestErrors: any[];
  latestWarnings: any[];
  wallets: {
    treasury: Wallet;
    availableWallets: Record<string, Wallet>;
    pendingWallets: Record<string, unknown>;
    unusableWallets: Record<string, unknown>;
    all: Record<string, Wallet>;
    initialState: {
      treasuryBalance: number;
      poolBalance: number;
      total: number;
    };
  };
};

type MemoryUsage = {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
};

type MetadataNetwork = {
  decimals: number;
  supportEIP1559: boolean;
  walletThresholds: {
    initial: number;
    refill: number;
    purge: number;
    minTreasury: number;
  };
  walletPoolSize: number;
  poolUtilizationThresholdPerc: number;
  walletDerivationPath: string;
  disperseSleepMillis: number;
};

type Metadata = {
  version: string;
  walletPoolRedundancyFactor: number;
  networks: Record<string, MetadataNetwork>;
};

export type WalletManagerResponse = {
  status: string;
  uptime: number;
  version: string;
  memory: {
    heapUsedMB: number;
    rssUsedMB: number;
    memoryUsage: MemoryUsage;
  };
  errorCount: number;
  latestErrors: any[];
  latestWarnings: any[];
  networks: Record<string, Network>;
  metadata: Metadata;
  timestamp: number;
};

export enum WalletManagerAlert {
  UnusableWallets = 'UNUSABLE_WALLETS',
  LowTresuryBalance = 'LOW_TRESURY_BALANCE',
  LowAvailableWallets = 'LOW_AVAILABLE_WALLETS',
  NetworkDown = 'NETWORK_DOWN',
}
