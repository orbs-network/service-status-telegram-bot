export type LiquidityHubTaker = {
  name: string;
  status: string;
  bids: number;
};

export enum LiquidityHubAlert {
  TakerDown = 'TakerDown',
}
