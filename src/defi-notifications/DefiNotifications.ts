import { table, getBorderCharacters } from 'table';
import { truncate } from '../utils';
import { NotificationType, NotificationTypeNames } from '../types';
import { DefiNotificationsStatus } from './types';

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
    try {
      const statuses = await DefiNotifications.loadStatuses();
      const tableOutput = statuses.map((status) => [
        truncate(status.name, 20),
        status.status === 'OK' ? '✅' : status.status,
      ]);
      output += `\`\`\`${table(tableOutput, {
        border: getBorderCharacters('void'),
      })}\`\`\``;
    } catch (err) {
      console.error('Error running Defi report', err);
      output += 'Error running Defi report';
    }
    return output;
  }
}