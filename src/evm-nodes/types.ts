export type EvmNodeStatus = {
  status: string;
  network: string;
  lastBlockNumber: number;
  timeSinceLastBlock: number;
  timeSinceUpgrade: number;
  freeDiskSpace: number;
  freeMemory: number;
  cpuUsage: number;
  uptime: number;
  timestamp: string;
};

export enum EvmNodeAlert {
  NodeDown = 'NODE_DOWN',
  LowDiskSpace = 'LOW_DISK_SPACE',
}
