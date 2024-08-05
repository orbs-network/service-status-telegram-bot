import { getBinance, getSummary } from './query';
import { ElasticsearchResponse, PairExposureComparison, PerpsAlert } from './types';
import { dollar } from '../utils';
import { format, startOfDay, subDays } from 'date-fns';
import { Alert, NotificationType, NotificationTypeNames } from '../types';
import { getBinanceOutput, getSummaryOutput } from './utils';

export const kibanaEndpoint = 'http://3.141.233.132:9200/orbs-perps-lambda*/_search';
const stagingEndpoint =
  'http://nginx-staging-lb-1142917146.ap-northeast-1.elb.amazonaws.com/analytics/v1';
const prodEndpoint = 'http://nginx-prod-lb-501211187.ap-northeast-1.elb.amazonaws.com/analytics/v1';

const hedgerProdApiUrl = 'https://staging.perps-streaming.com/analytics/v1';

export class Perps {
  static async summary(env: string, startDate: Date, endDate: Date) {
    let output = '';
    try {
      const resp = await fetch(kibanaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: getSummary(env, startDate, endDate),
      });

      if (resp.status !== 200) {
        throw new Error('Error fetching Kibana data');
      }

      const data = (await resp.json()) as ElasticsearchResponse;

      const liqResp = await fetch(
        `${hedgerProdApiUrl}/aggregated-trades?earliestTimeMs=${startDate.getTime()}&latestTimeMs=${endDate.getTime()}&quoteStatus=LIQUIDATED&limit=1000&partyBs=0xD5A075C88A4188d666FA1e4051913BE6782982DA%2C0x614bB1F3e0Ae5A393979468ED89088F05277312c%2C0x00c069d68bc7420740460DBC3cc3fFF9b3742421`
      );

      if (liqResp.status !== 200) {
        throw new Error('Error fetching liquidations');
      }

      const liqData = (await liqResp.json()) as any[];

      output += getSummaryOutput(data, liqData);
    } catch (err) {
      console.error('Perps report summary', err);
      output += '\nError getting summary';
    }
    return output;
  }

  static async binance(env: string, startDate: Date, endDate: Date) {
    let output = '';
    try {
      const resp = await fetch(kibanaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: getBinance(env, startDate, endDate),
      });

      if (resp.status !== 200) {
        throw new Error('Error fetching Kibana data');
      }

      const data = (await resp.json()) as ElasticsearchResponse;

      output += getBinanceOutput(data);
    } catch (err) {
      console.error('Perps report', err);
      output += '\nError running Perps report';
    }
    return output;
  }

  static async report() {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, 1);

    let output = `📊 *${NotificationTypeNames[NotificationType.PerpsDailyReport]}* - ${format(
      startDate,
      'dd/MM/yyyy'
    )}`;

    const envs = ['prod'];

    for (const env of envs) {
      output += `\n\n*${env.toUpperCase()}*\n`;
      output += await Perps.summary(env, startDate, endDate);
      output += '\n\n';
      output += await Perps.binance(env, startDate, endDate);
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

        const EPSILON = 1e-10;

        data.forEach((d) => {
          if (d.quantityDelta > EPSILON) {
            const exposure = dollar.format(d.quantityDelta * d.markPrice);
            alerts.push({
              notificationType,
              alertType: PerpsAlert.PerpsExposure,
              name: d.symbol,
              timestamp: new Date().getTime(),
              message: `🚨 *Exposure Alert* 🚨\n\nEnv: *${isProd ? 'PROD' : 'STAGING'}*\nSymbol: *${
                d.symbol
              }*\nAmount: *${exposure}*\nQuantity Delta: *${d.quantityDelta}*`,
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
          message: `🚨 *Perps Analytics Api Down* [${isProd ? 'PROD' : 'STAGING'}]`,
        });
      }
    }

    return alerts;
  }
}
