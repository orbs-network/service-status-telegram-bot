import { table, getBorderCharacters } from 'table';
import { truncate } from '../utils';
import { LiquidityHubAlert, LiquidityHubTaker } from './types';
import { config } from '../config';
import { Alert, NotificationType } from '../types';

export class LiquidityHub {
  static async loadBackupTakers() {
    const takers: LiquidityHubTaker[] = [];

    try {
      const backupTakers = [
        'https://clob-taker-paraswap-49d0d7fa5af9.herokuapp.com/health',
        'https://clob-taker-odos-6e16140d766f.herokuapp.com/health',
        'https://clob-taker-openocean-13433c2259af.herokuapp.com/health',
        'https://clob-taker-kyber-ad09eb45b09c.herokuapp.com/health',
        'https://clob-taker-univ2-464531c10f05.herokuapp.com/health',
        'https://clob-taker-manifold-d96876edee4d.herokuapp.com/health',
        'https://clob-taker-rango-9efa32bb61a1.herokuapp.com/health',
      ];

      const results = await Promise.allSettled(backupTakers.map((url) => fetch(url)));
      for (const result of results) {
        if (result.status === 'rejected') {
          continue;
        }
        const resp = (await result.value.json()) as {
          nodeAddress: string;
          Status: string;
          total: { bids: number };
        };

        if (!resp.Status) {
          continue;
        }

        takers.push({
          name: resp.nodeAddress,
          status: resp.Status.substring(9, resp.Status.indexOf(',')).trim(),
          bids: resp.total.bids,
        });
      }
    } catch (err) {
      console.error('Error loading LH takers', err);
    }
    return takers;
  }

  static async report() {
    let output = '📊 *LH Takers*\n\n';
    try {
      const takers = await LiquidityHub.loadBackupTakers();
      const tableOutput = [
        ['', 'Bids', 'Status'],
        ...takers.map((taker) => [
          truncate(taker.name, 20),
          taker.bids,
          taker.status === 'OK' ? '✅' : taker.status,
        ]),
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
    } catch (err) {
      console.error('Error running LH report', err);
      output += 'Error running LH report';
    }
    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const takers = await LiquidityHub.loadBackupTakers();
      takers.forEach((taker) => {
        if (taker.status !== 'OK') {
          alerts.push({
            notificationType: NotificationType.LiquidityHubAlerts,
            alertType: LiquidityHubAlert.TakerDown,
            name: taker.name,
            timestamp: new Date().getTime(),
            message: `🚨 *LH TAKER DOWN* 🚨\n\n${taker.name} is down!`,
          });
        }
      });
    } catch (err) {
      console.error('Error running LH alerts', err);
    }
    return alerts;
  }
}
