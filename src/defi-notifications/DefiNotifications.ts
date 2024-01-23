import { table, getBorderCharacters } from 'table';
import { truncate } from '../utils';
import { Alert, NotificationType, NotificationTypeNames } from '../types';
import { DefiNotificationsAlert, DefiNotificationsStatus } from './types';
import { config } from '../config';

export class DefiNotifications {
  static async loadStatuses() {
    const statuses: DefiNotificationsStatus[] = [];

    try {
      const detectorResults = await fetch(
        'https://open-defi-notifications-detect.herokuapp.com/health'
      );
      const detectorStatus = (await detectorResults.json()) as { status: string };
      statuses.push({
        name: 'Detector',
        status: detectorStatus.status,
      });

      const managerResults = await fetch(
        'https://us-central1-open-defi-notifications.cloudfunctions.net/app/health'
      );
      const managerStatus = (await managerResults.json()) as { status: string };
      statuses.push({
        name: 'Manager',
        status: managerStatus.status,
      });

      const l3Results = await fetch('https://odnp-l3-test-node.global.ssl.fastly.net/health');
      const l3Status = (await l3Results.json()) as { Status: string };
      statuses.push({
        name: 'Orbs L3',
        status: l3Status.Status.substring(9, l3Status.Status.indexOf(',')).trim(),
      });
    } catch (err) {
      console.error('Error loading Defi Notifications statuses', err);
    }
    return statuses;
  }

  static async report() {
    let output = `📊 *${NotificationTypeNames[NotificationType.DefiNotifications]}*\n\n`;
    let errors = '';
    try {
      const statuses = await DefiNotifications.loadStatuses();
      const tableOutput = [
        ['', 'Status'],
        ...statuses.map((status) => {
          if (status.status !== 'OK') {
            errors += `- *${status.name}*: ${status.status}\n`;
          }

          return [truncate(status.name, 20), status.status === 'OK' ? '✅' : '❌'];
        }),
      ];
      output += `\`\`\`\n${table(tableOutput, config.AsciiTableOpts)}\n\`\`\``;
      if (errors.length > 0) {
        output += `\n\n❌ *ERRORS*:\n\n${errors}`;
      }
    } catch (err) {
      console.error('Error running Defi report', err);
      output += 'Error running Defi report';
    }
    return output;
  }

  static async alerts() {
    const alerts: Alert[] = [];
    try {
      const takers = await DefiNotifications.loadStatuses();
      takers.forEach((status) => {
        if (status.status !== 'OK') {
          alerts.push({
            notificationType: NotificationType.DefiNotificationsAlerts,
            alertType: DefiNotificationsAlert.ServiceDown,
            name: status.name,
            timestamp: new Date().getTime(),
            message: `🚨 *DeFi SERVICE STATUS* 🚨\n\n*${status.name}*: ${status.status}`,
          });
        }
      });
    } catch (err) {
      console.error('Error running Defi alerts', err);
    }
    return alerts;
  }
}
