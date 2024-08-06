import { table } from 'table';
import { config } from '../config';
import { dollar } from '../utils';
import { ElasticsearchResponse } from './types';

function getSummaryTotalFunds(data: ElasticsearchResponse) {
  const marginBalance =
    Number(
      data.aggregations[0].buckets[0].marginBalance?.marginBalance.hits?.hits[0].fields
        .marginBalanceNum[0]
    ) || 0;
  const erc20Balance =
    Number(
      data.aggregations[0].buckets[0].erc20Balance?.erc20Balance.hits?.hits[0].fields
        .erc20BalanceNum[0]
    ) || 0;
  const totalPartyBUnPnl =
    Number(
      data.aggregations[0].buckets[0].totalPartyBUnPnl?.totalPartyBUnPnl.hits?.hits[0].fields
        .totalPartyBUnPnl[0]
    ) || 0;
  const brokerUpnl =
    Number(
      data.aggregations[0].buckets[0].brokerUpnl?.brokerUpnl.hits?.hits[0].fields.brokerUpnl[0]
    ) || 0;
  const partyBAllocatedBalance =
    Number(
      data.aggregations[0].buckets[0].partyBAllocatedBalance?.partyBAllocatedBalance.hits?.hits[0]
        .fields.partyBAllocatedBalanceNum[0]
    ) || 0;
  return {
    totalFunds: marginBalance + erc20Balance + totalPartyBUnPnl + partyBAllocatedBalance,
    brokerUpnl,
    totalPartyBUnPnl,
  };
}

export function getSummaryOutput(
  todayData: ElasticsearchResponse,
  liqData: any[],
  yesterdayData: ElasticsearchResponse
) {
  const { totalFunds, totalPartyBUnPnl, brokerUpnl } = getSummaryTotalFunds(todayData);
  const { totalFunds: yesterdayTotalFunds } = getSummaryTotalFunds(yesterdayData);

  const volume = todayData.aggregations[0].buckets[0].volume?.volume.value || 0;
  const users = todayData.aggregations[0].buckets[0].users?.users.value || 0;
  const trades = todayData.aggregations[0].buckets[0].trades?.doc_count || 0;
  const netUpnl = brokerUpnl + totalPartyBUnPnl;
  const netUpnlVolPercentage = (netUpnl / volume) * 100;
  const netUpnlFundsPercentage = (netUpnl / totalFunds) * 100;

  const tableOutput = [
    ['Total Funds', dollar.format(totalFunds)],
    ['Funds Delta', dollar.format(totalFunds - yesterdayTotalFunds)],
    ['Volume', dollar.format(volume)],
    ['Trades', trades],
    ['Liqs.', liqData.length],
    ['Users', users],
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

export function getBinanceOutput(data: ElasticsearchResponse) {
  const marginBalance =
    Number(
      data.aggregations[0].buckets[0].marginBalance?.marginBalance.hits?.hits[0].fields
        .marginBalanceNum[0]
    ) || 0;
  const leverage =
    Number(
      data.aggregations[0].buckets[0].leverage?.leverage.hits?.hits[0].fields['leverage.keyword'][0]
    ) || 0;
  const maintenanceMargin =
    Number(
      data.aggregations[0].buckets[0].maintenanceMargin?.maintenanceMargin.hits?.hits[0].fields[
        'maintenanceMargin.keyword'
      ][0]
    ) || 0;

  const tableOutput = [
    ['Margin Balance', dollar.format(marginBalance)],
    ['Leverage', Number(leverage).toFixed(3)],
    ['Maint. Margin', dollar.format(maintenanceMargin)],
  ];

  let output = `*BINANCE*\n`;
  output += `\`\`\`\n${table(tableOutput, {
    ...config.AsciiTableOpts,
    columns: {
      0: { width: 8, wrapWord: true },
    },
  })}\n\`\`\``;

  return output;
}

export function getCrossChainOutput(data: ElasticsearchResponse) {
  const erc20Balance =
    Number(
      data.aggregations[0].buckets[0].erc20Balance?.erc20Balance.hits?.hits[0].fields
        .erc20BalanceNum[0]
    ) || 0;
  const totalPartyBUnPnl =
    Number(
      data.aggregations[0].buckets[0].totalPartyBUnPnl?.totalPartyBUnPnl.hits?.hits[0].fields
        .totalPartyBUnPnl[0]
    ) || 0;
  const partyBAllocatedBalance =
    Number(
      data.aggregations[0].buckets[0].partyBAllocatedBalance?.partyBAllocatedBalance.hits?.hits[0]
        .fields.partyBAllocatedBalanceNum[0]
    ) || 0;
  const totalFunds = erc20Balance + totalPartyBUnPnl + partyBAllocatedBalance;
  const longNotional =
    Number(
      data.aggregations[0].buckets[0].totalInitialLongNotional?.totalInitialLongNotional.hits
        ?.hits[0].fields.totalInitialLongNotional[0]
    ) || 0;
  const shortNotional =
    Number(
      data.aggregations[0].buckets[0].totalInitialShortNotional?.totalInitialShortNotional.hits
        ?.hits[0].fields.totalInitialShortNotional[0]
    ) || 0;
  const longShortRatio =
    Number(
      data.aggregations[0].buckets[0].initialLongShortRatio?.initialLongShortRatio.hits?.hits[0]
        .fields.initialLongShortRatio[0]
    ) || 0;

  const tableOutput = [
    ['Total Funds', dollar.format(totalFunds)],
    ['Alloc.', dollar.format(partyBAllocatedBalance)],
    ['Longs', dollar.format(longNotional)],
    ['Shorts', dollar.format(shortNotional)],
    ['L/S Ratio', longShortRatio],
  ];

  let output = `*CROSS CHAIN*\n`;
  output += `\`\`\`\n${table(tableOutput, {
    ...config.AsciiTableOpts,
    columns: {
      0: { width: 8, wrapWord: true },
    },
  })}\n\`\`\``;

  return output;
}
