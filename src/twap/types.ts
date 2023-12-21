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

export type TakerStatus = {
  name: string;
  status: string;
  timestamp: number;
};
