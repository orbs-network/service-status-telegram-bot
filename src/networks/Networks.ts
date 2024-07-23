// https://status.orbs.network/json

import { table } from 'table';
import { Alert, NotificationType, NotificationTypeNames } from '../types';
import { truncate } from '../utils';
import { config } from '../config';

type NetworkStatus = {
  Statuses: {
    [key: string]: {
      Status: string;
    };
  };
};

enum NetworkAlert {
  NetworkDown = 'NetworkDown',
}

export class Networks {
  static async report() {
    let output = `📊 *${NotificationTypeNames[NotificationType.Network]}*\n\n`;
    let errors = '';
    try {
      const resp = await fetch('https://status.orbs.network/json');

      if (resp.status !== 200) {
        throw new Error('Fetching network statuses');
      }

      const data = (await resp.json()) as NetworkStatus;

      const tableOutput = [
        ['', 'Status'],
        ...Object.entries(data.Statuses).map(([network, status]) => {
          if (status.Status !== 'Green') {
            errors += `- *${network}*: ${status}\n`;
          }

          return [truncate(network, 20), status.Status === 'Green' ? '✅' : '❌'];
        }),
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
      if (errors.length > 0) {
        output += `\n\n❌ *ERRORS*:\n\n${errors}`;
      }
    } catch (err) {
      console.error('Error running Network report', err);
      output += 'Error running Network report';
    }
    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const resp = await fetch('https://status.orbs.network/json');

      if (resp.status !== 200) {
        throw new Error('Fetching network statuses');
      }

      const data = (await resp.json()) as NetworkStatus;

      const statuses = {
        ...data.Statuses,
        'TESTING ALERT': {
          Status: 'Yellow',
        },
      };

      Object.entries(statuses).forEach(([network, status]) => {
        if (status.Status !== 'Green') {
          alerts.push({
            notificationType: NotificationType.NetworkAlerts,
            alertType: NetworkAlert.NetworkDown,
            name: network,
            timestamp: new Date().getTime(),
            message: `🚨 *${
              NotificationTypeNames[NotificationType.NetworkAlerts]
            }* 🚨\n\n*${network}*: ${status.Status}`,
          });
        }
      });
    } catch (err) {
      console.error('Error Network alerts', err);
    }
    return alerts;
  }
}
