export interface ElasticsearchResponse {
  took: number;
  timed_out: boolean;
  _shards: Shards;
  hits: Hits;
  aggregations: { [key: string]: Aggregation };
}

interface Shards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

interface Hits {
  total: {
    value: number;
    relation: string;
  };
  max_score: null;
  hits: Array<any>;
}

interface Aggregation {
  buckets: Bucket[];
}

interface Bucket {
  key_as_string: string;
  key: number;
  doc_count: number;
  volume?: DocCountValue;
  erc20Balance?: {
    erc20Balance: DocCountHits;
  };
  totalPartyBUnPnl?: {
    totalPartyBUnPnl: DocCountHits;
  };
  gasPaid?: Value;
  trades?: DocCount;
  brokerUpnl?: {
    brokerUpnl: DocCountHits;
  };
  users?: DocCountValue;
  marginBalance?: {
    marginBalance: DocCountHits;
  };
  partyBAllocatedBalance?: {
    partyBAllocatedBalance: DocCountHits;
  };
}

interface DocCount {
  doc_count: number;
}

interface DocCountValue {
  [key: string]: {
    value?: number;
  };
}

interface DocCountHits extends DocCount {
  hits?: HitsContent;
}

interface HitsContent {
  total: {
    value: number;
    relation: string;
  };
  max_score: null;
  hits: Array<HitItem>;
}

interface HitItem {
  _index: string;
  _type: string;
  _id: string;
  _score: null;
  fields: {
    [key: string]: Array<number>;
  };
  sort: number[];
}

interface Value {
  value: number;
}

export type PairExposureComparison = {
  symbol: string;
  markPrice: number;
  onchainQuantity: number;
  brokerQuantity: number;
  quantityDelta: number;
  quantityDeltaPercentage: number | string;
  onchainEntryPrice: number;
  brokerEntryPrice: number;
  entryPriceDelta: number;
  entryPriceDeltaPercentage: number | string;
  onchainUnPnl: number;
  brokerUnPnl: number;
  unPnlDelta: number;
  unPnlDeltaPercentage: number | string;
};
