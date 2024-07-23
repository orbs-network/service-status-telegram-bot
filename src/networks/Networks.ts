// https://status.orbs.network/json

import { Alert, NotificationType, NotificationTypeNames } from '../types';

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
  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const resp = await fetch('https://status.orbs.network/json');

      if (resp.status !== 200) {
        throw new Error('Fetching network statuses');
      }

      const statuses = (await resp.json()) as NetworkStatus;

      Object.entries(statuses.Statuses).forEach(([network, status]) => {
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
