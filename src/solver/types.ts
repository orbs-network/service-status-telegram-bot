export type SolverStatus = {
  startedAt: string;
  Timestamp: string;
  Status: string;
  Hostname: string;
  env: string;
  loggerEndpoint: string;
  port: string;
  clusterSize: string;
  networks: {
    bsc: string[];
  };
  rssUsedMB: number;
  heapUsedMB: number;
  Payload: {
    Uptime: number;
    MemoryUsage: number;
  };
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
};

export enum SolverAlert {
  SolverDown = 'SolverDown',
}
