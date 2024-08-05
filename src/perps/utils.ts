import { table } from 'table';
import { config } from '../config';
import { dollar } from '../utils';
import { ElasticsearchResponse } from './types';

export function getSummaryOutput(env: string, data: ElasticsearchResponse, liqData: any[]) {
  const marginBalance =
    data.aggregations[0].buckets[0].marginBalance?.marginBalance.hits?.hits[0].fields
      .marginBalanceNum[0] || 0;
  const erc20Balance =
    data.aggregations[0].buckets[0].erc20Balance?.erc20Balance.hits?.hits[0].fields
      .erc20BalanceNum[0] || 0;
  const totalPartyBUnPnl =
    data.aggregations[0].buckets[0].totalPartyBUnPnl?.totalPartyBUnPnl.hits?.hits[0].fields
      .totalPartyBUnPnl[0] || 0;
  const brokerUpnl =
    data.aggregations[0].buckets[0].brokerUpnl?.brokerUpnl.hits?.hits[0].fields.brokerUpnl[0] || 0;
  const partyBAllocatedBalance =
    data.aggregations[0].buckets[0].partyBAllocatedBalance?.partyBAllocatedBalance.hits?.hits[0]
      .fields.partyBAllocatedBalanceNum[0] || 0;
  const volume = data.aggregations[0].buckets[0].volume?.volume.value || 0;
  const users = data.aggregations[0].buckets[0].users?.users.value || 0;
  const trades = data.aggregations[0].buckets[0].trades?.doc_count || 0;
  const totalFunds = marginBalance + erc20Balance + totalPartyBUnPnl + partyBAllocatedBalance;
  const netUpnl = brokerUpnl + totalPartyBUnPnl;
  const netUpnlVolPercentage = (netUpnl / volume) * 100;
  const netUpnlFundsPercentage = (netUpnl / totalFunds) * 100;

  const tableOutput = [
    ['Total Funds', dollar.format(totalFunds)],
    ['Volume', dollar.format(volume)],
    ['Trades', trades],
    ['Liqs.', liqData.length],
    ['Users', users],
    ['Net uPnL', dollar.format(netUpnl)],
    ['Net uPnL to Vol', netUpnlVolPercentage.toFixed(2) + '%'],
    ['Net uPnL to Funds', netUpnlFundsPercentage.toFixed(2) + '%'],
  ];

  let output = `*SUMMARY*\n`;
  output += `\`\`\`\n${table(tableOutput, {
    ...config.AsciiTableOpts,
    columns: {
      0: { width: 8, wrapWord: true },
    },
  })}\n\`\`\``;

  return output;
}