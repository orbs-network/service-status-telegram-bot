import { table } from 'table';
import { BackupTaker, TwapAlert, TakerStatus } from './types';
import { truncate } from '../utils';
import { config } from '../config';
import { Alert, NotificationType, NotificationTypeNames } from '../types';

export class Twap {
  static async loadBackupTakers() {
    const takers: TakerStatus[] = [];
    try {
      const backupTakers = [
        'https://twap-taker-1.herokuapp.com/health',
        'https://twap-taker-2.herokuapp.com/health',
        'http://107.6.165.78:8080/health',
      ];

      const results = await Promise.allSettled(backupTakers.map((url) => fetch(url)));
      for (const result of results) {
        if (result.status === 'rejected') {
          continue;
        }
        const resp = (await result.value.json()) as BackupTaker;

        if (!resp.Status) {
          continue;
        }
        takers.push({
          name: resp.nodeAddress,
          status: resp.Status.substring(9, resp.Status.indexOf(',')).trim(),
          timestamp: Date.parse(resp.Timestamp),
          bids: resp.total.bids,
          fills: resp.total.fills,
        });
      }
    } catch (err) {
      console.error('Error loading TWAP takers', err);
    }
    return takers;
  }

  // static async loadTakers() {
  //   const takers: TakerStatus[] = [];
  //   try {
  //     const result = await fetch('https://status.orbs.network/json-full');

  //     const l3status = (await result.json()) as L3Status;

  //     for (const committeeNode of Object.values(l3status.CommitteeNodes)) {
  //       const twapL3Status = committeeNode.NodeServices['vm-twap'];

  //       if (!twapL3Status) {
  //         continue;
  //       }

  //       const takerStatus = twapL3Status.VMStatusJson;

  //       if (!takerStatus) {
  //         continue;
  //       }

  //       takers.push({
  //         name: committeeNode.Name,
  //         status: takerStatus.Status.substring(9, takerStatus.Status.indexOf(',')).trim(),
  //         timestamp: Date.parse(takerStatus.Timestamp),
  //       });
  //     }
  //   } catch (err) {
  //     console.error('Error loading TWAP takers', err);
  //   }
  //   return takers;
  // }

  static async report() {
    let output = `📊 *${NotificationTypeNames[NotificationType.Twap]}*\n\n`;
    let errors = '';
    try {
      const takers = await Twap.loadBackupTakers();
      const tableOutput = [
        ['', 'Bids', 'Fills', 'Status'],
        ...takers.map((taker) => {
          if (taker.status !== 'OK') {
            errors += `- *${taker.name}*: ${taker.status}\n`;
          }
          return [
            truncate(taker.name, 20),
            taker.bids,
            taker.fills,
            taker.status === 'OK' ? '✅' : '❌',
          ];
        }),
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
      if (errors.length > 0) {
        output += `\n\n❌ *ERRORS*:\n\n${errors}`;
      }
    } catch (err) {
      console.error('Error running TWAP report', err);
      output += 'Error running TWAP report';
    }
    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const takers = await Twap.loadBackupTakers();
      takers.forEach((taker) => {
        if (taker.status !== 'OK') {
          alerts.push({
            notificationType: NotificationType.TwapAlerts,
            alertType: TwapAlert.TakerDown,
            name: taker.name,
            timestamp: taker.timestamp,
            message: `🚨 *${NotificationTypeNames[NotificationType.TwapAlerts]}* 🚨\n\n*${
              taker.name
            }*: ${taker.status}`,
          });
        }
      });
    } catch (err) {
      console.error('Error running TWAP alerts', err);
    }
    return alerts;
  }
}
