export type EvmNodeStatus = {
  name: string;
  lastBlockNumber: number;
  timeSinceLastBlock: number;
  timeSinceUpgrade: number;
  freeDiskSpace: number;
  freeMemory: number;
  cpuUsage: number;
  uptime: number;
  status: string;
  timestamp: string;
};

export enum EvmNodeAlert {
  NodeDown = 'NODE_DOWN',
}
