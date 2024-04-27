import { table } from 'table';
import { config } from '../config';
import { getQuery } from './query';
import { ElasticsearchResponse, PairExposureComparison, PerpsAlert } from './types';
import { dollar } from '../utils';
import { format, subDays } from 'date-fns';
import { Alert, NotificationType, NotificationTypeNames } from '../types';

const kibanaEndpoint = 'http://3.141.233.132:9200/orbs-perps-hedger*/_search';
const stagingEndpoint =
  'http://nginx-staging-lb-1142917146.ap-northeast-1.elb.amazonaws.com/analytics/v1';
const prodEndpoint = 'http://nginx-prod-lb-501211187.ap-northeast-1.elb.amazonaws.com/analytics/v1';

export class Perps {
  static async report() {
    let output = `📊 *${NotificationTypeNames[NotificationType.PerpsDailyReport]}* - ${format(
      subDays(new Date(), 1),
      'dd/MM/yyyy'
    )}`;

    const envs = ['staging', 'prod'];

    for (const env of envs) {
      try {
        const resp = await fetch(kibanaEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: getQuery(env),
        });

        const data = (await resp.json()) as ElasticsearchResponse;

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
          data.aggregations[0].buckets[0].brokerUpnl?.brokerUpnl.hits?.hits[0].fields[
            'upnl.keyword'
          ][0] || 0;
        const partyBAllocatedBalance =
          data.aggregations[0].buckets[0].partyBAllocatedBalance?.partyBAllocatedBalance.hits
            ?.hits[0].fields.partyBAllocatedBalanceNum[0] || 0;
        const volume = data.aggregations[0].buckets[0].volume?.volume.value || 0;
        const gasPaid = data.aggregations[0].buckets[0].gasPaid?.value || 0;
        const users = data.aggregations[0].buckets[0].users?.users.value || 0;
        const trades = data.aggregations[0].buckets[0].trades?.doc_count || 0;

        const totalFunds = marginBalance + erc20Balance + totalPartyBUnPnl + partyBAllocatedBalance;
        const onChainValue = totalPartyBUnPnl + partyBAllocatedBalance + erc20Balance;

        const tableOutput = [
          ['Trades', trades],
          ['Users', users],
          ['Volume', dollar.format(volume)],
          ['Gas Paid', `${Number(gasPaid.toFixed(5))} BNB`],
          ['Total Funds', dollar.format(totalFunds)],
          ['On-chain Value', dollar.format(onChainValue)],
          ['Binance Value', dollar.format(marginBalance)],
          ['On-chain uPnL', dollar.format(totalPartyBUnPnl)],
          ['On-chain Alloc.', dollar.format(partyBAllocatedBalance)],
          ['On-chain Unalloc.', dollar.format(erc20Balance)],
          ['Binance uPnL', dollar.format(brokerUpnl)],
        ];

        output += `\n\n*${env.toUpperCase()}*\n`;
        output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
      } catch (err) {
        console.error('Error running Perps report', err);
        output += '\nError running Perps report';
      }
    }

    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];

    const endpoints = [stagingEndpoint, prodEndpoint];

    for (const url of endpoints) {
      const isProd = url === prodEndpoint;
      const notificationType = isProd
        ? NotificationType.PerpsExposureAlertsProd
        : NotificationType.PerpsExposureAlertsStaging;

      try {
        const resp = await fetch(`${url}/exposure-comparison`);
        if (resp.status !== 200) {
          throw new Error('Error fetching hedger exposure');
        }

        const data = (await resp.json()) as PairExposureComparison[];

        data.forEach((d) => {
          if (d.quantityDelta > 0) {
            alerts.push({
              notificationType,
              alertType: PerpsAlert.PerpsExposure,
              name: d.symbol,
              timestamp: new Date().getTime(),
              message: `🚨 *${NotificationTypeNames[notificationType]}* 🚨\n\n*${
                d.symbol
              }*: ${dollar.format(d.quantityDelta * d.markPrice)}`,
            });
          }
        });
      } catch (err) {
        console.error('Error getting Perps Exposure alerts', err);
        alerts.push({
          notificationType,
          alertType: PerpsAlert.PerpsApiDown,
          name: 'Perps Analytics Api Down',
          timestamp: new Date().getTime(),
          message: `🚨 *Perps Analytics Api Down* [${url === prodEndpoint ? 'PROD' : 'STAGING'}]🚨`,
        });
      }
    }

    return alerts;
  }
}
