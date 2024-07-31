// https://status.orbs.network/json

import { table } from 'table';
import { Alert, NotificationType, NotificationTypeNames } from '../types';
import { truncate } from '../utils';
import { config } from '../config';

const endpointUrl = 'https://solver.orbs.network:8443/orbs-solver/status';

type NetworkStatus = {
  Hostname: string;
  Status: string;
  Error: string;
};

enum NetworkAlert {
  NetworkDown = 'NetworkDown',
}

export class Networks {
  static async report() {
    let output = `📊 *${NotificationTypeNames[NotificationType.Network]}*\n\n`;
    let errors = '';
    try {
      const resp = await fetch(endpointUrl);

      if (resp.status !== 200) {
        throw new Error('Fetching network statuses');
      }

      const data = (await resp.json()) as NetworkStatus;

      if (data.Status !== 'OK') {
        errors += `- *${data.Hostname}*: ${data.Error}\n`;
      }

      const tableOutput = [
        ['', 'Status'],

        [truncate(data.Hostname, 20), data.Status === 'OK' ? '✅' : '❌'],
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
      const resp = await fetch(endpointUrl);

      if (resp.status !== 200) {
        throw new Error('Fetching network statuses');
      }

      const data = (await resp.json()) as NetworkStatus;

      if (data.Status !== 'OK') {
        alerts.push({
          notificationType: NotificationType.NetworkAlerts,
          alertType: NetworkAlert.NetworkDown,
          name: data.Hostname,
          timestamp: new Date().getTime(),
          message: `🚨 *${NotificationTypeNames[NotificationType.NetworkAlerts]}* 🚨\n\n*${
            data.Hostname
          }*: ${data.Error}`,
        });
      }
    } catch (err) {
      console.error('Error Network alerts', err);
    }
    return alerts;
  }
}
