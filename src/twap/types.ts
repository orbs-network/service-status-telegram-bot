export type L3Status = {
  CommitteeNodes: {
    [nodeId: string]: {
      Name: string;
      NodeServices: {
        'vm-twap': {
          VMStatusJson: {
            Status: string;
            Timestamp: string;
          };
        };
      };
    };
  };
};

export type BackupTaker = {
  nodeAddress: string;
  Status: string;
  Timestamp: string;
  total: {
    bids: number;
    fills: number;
  };
};

export type TakerStatus = {
  name: string;
  status: string;
  timestamp: number;
  bids: number;
  fills: number;
};

export enum TwapAlert {
  TakerDown = 'TAKER_DOWN',
}
