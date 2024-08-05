import { getSummary } from './query';
import { ElasticsearchResponse, PairExposureComparison, PerpsAlert } from './types';
import { dollar } from '../utils';
import { format, startOfDay, subDays } from 'date-fns';
import { Alert, NotificationType, NotificationTypeNames } from '../types';
import { getSummaryTableOutput } from './utils';

export const kibanaEndpoint = 'http://3.141.233.132:9200/orbs-perps-lambda*/_search';
const stagingEndpoint =
  'http://nginx-staging-lb-1142917146.ap-northeast-1.elb.amazonaws.com/analytics/v1';
const prodEndpoint = 'http://nginx-prod-lb-501211187.ap-northeast-1.elb.amazonaws.com/analytics/v1';

const hedgerProdApiUrl = 'https://staging.perps-streaming.com/analytics/v1';

export class Perps {
  static async report() {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, 1);

    let output = `📊 *${NotificationTypeNames[NotificationType.PerpsDailyReport]}* - ${format(
      startDate,
      'dd/MM/yyyy'
    )}`;

    const envs = ['prod'];

    for (const env of envs) {
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
          `${hedgerProdApiUrl}/aggregated-trades?earliestTimeMs=${startDate.getTime()}&latestTimeMs=${endDate.getTime()}&quoteStatus=LIQUIDATED&limit=1000`
        );

        if (liqResp.status !== 200) {
          throw new Error('Error fetching liquidations');
        }

        const liqData = (await liqResp.json()) as any[];

        output += getSummaryTableOutput(env, data, liqData);
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
